
from typing import Dict, List, Tuple
import math

Asset = str

def apply_persona_rules(base_alloc: Dict[Asset, float], persona: Dict, scen_id: str) -> Dict[Asset, float]:
    """
    Enforce persona-specific hard/soft constraints and stress toggles.
    - persona expects keys: id, tech_bias (0-1), leverage_property (0-1), risk_band (e.g., "low"/"med"/"high")
    """
    alloc = base_alloc.copy()

    # P016 BTL Mogul: property caps + deleveraging in gilt selloff/stagflation
    if persona.get("id") == "P016":
        max_prop = 0.65
        if scen_id in ("S009", "S007"):
            max_prop = 0.45  # deleveraging proxy under rate shock/stagflation
        prop_keys = [k for k in alloc.keys() if "PROPERTY" in k or "REIT" in k]
        prop_total = sum(alloc[k] for k in prop_keys if k in alloc)
        if prop_total > max_prop and prop_total > 0:
            scale = max_prop / prop_total
            for k in prop_keys:
                if k in alloc:
                    alloc[k] *= scale
            # re-allocate excess equally to CASH and BILLS_SHORT_GILTS (liquidity floor)
            excess = 1.0 - sum(alloc.values())
            alloc["CASH"] = alloc.get("CASH", 0.0) + 0.5 * excess
            alloc["BILLS_SHORT_GILTS"] = alloc.get("BILLS_SHORT_GILTS", 0.0) + 0.5 * excess

    # P003 Crypto Enthusiast: dynamic crypto cap if tech correlation is extreme in Tech Burst
    if persona.get("id") == "P003" and scen_id == "S004":
        crypto_cap = 0.15
        crypto_keys = [k for k in alloc.keys() if "CRYPTO" in k]
        crypto_total = sum(alloc.get(k, 0.0) for k in crypto_keys)
        if crypto_total > crypto_cap and crypto_total > 0:
            scale = crypto_cap / crypto_total
            for k in crypto_keys:
                if k in alloc:
                    alloc[k] *= scale
            # Allocate freed weight to IG_CREDIT and GILTS_LONG as flight-to-quality
            excess = 1.0 - sum(alloc.values())
            alloc["IG_CREDIT"] = alloc.get("IG_CREDIT", 0.0) + 0.6 * excess
            alloc["GILTS_LONG"] = alloc.get("GILTS_LONG", 0.0) + 0.4 * excess

    # Liquidity floor: min(10%, 2% × liquidity_months) across CASH + BILLS_SHORT_GILTS
    liq_months = persona.get("liquidity_months", 6)
    floor = max(0.10, 0.02 * liq_months)
    liq_total = alloc.get("CASH", 0.0) + alloc.get("BILLS_SHORT_GILTS", 0.0)
    if liq_total < floor:
        need = floor - liq_total
        # take proportionally from riskiest buckets
        risk_order = ["CRYPTO_ETH","CRYPTO_BTC","GROWTH_TECH","GLOBAL_EQUITY","HY_CREDIT","IG_CREDIT","PROPERTY_UK_RESI","ALTERNATIVES","COMMODITIES"]
        for k in risk_order:
            if need <= 0: break
            w = alloc.get(k, 0.0)
            if w > 0:
                take = min(need, 0.5 * w)
                alloc[k] = w - take
                need -= take
        alloc["CASH"] = alloc.get("CASH", 0.0) + 0.5 * (floor - liq_total)
        alloc["BILLS_SHORT_GILTS"] = alloc.get("BILLS_SHORT_GILTS", 0.0) + 0.5 * (floor - liq_total)

    # Concentration limits: 30% single asset class (except balanced flags)
    for k,v in list(alloc.items()):
        if v > 0.30:
            excess = v - 0.30
            alloc[k] = 0.30
            # redistribute to IG_CREDIT/GILTS_LONG/UK_EQUITY_VALUE
            alloc["IG_CREDIT"] = alloc.get("IG_CREDIT", 0.0) + 0.4 * excess
            alloc["GILTS_LONG"] = alloc.get("GILTS_LONG", 0.0) + 0.4 * excess
            alloc["UK_EQUITY_VALUE"] = alloc.get("UK_EQUITY_VALUE", 0.0) + 0.2 * excess

    # Normalise
    s = sum(alloc.values())
    if s > 0:
        for k in alloc:
            alloc[k] /= s
    return alloc


def optimize_cvar(weights_init: Dict[Asset,float],
                  scenario_paths: List[Dict[Asset, float]],
                  cvar_alpha: float = 0.05,
                  bounds: Dict[Asset, Tuple[float,float]] = None) -> Dict[Asset,float]:
    """
    Rockafellar-Uryasev CVaR LP skeleton. This returns a feasible w close to init if PuLP not available.
    Inputs:
      - scenario_paths: list of asset return scenarios (cumulative shocks), length = S; each is dict asset->return
      - bounds: optional per-asset (min,max)
    """
    try:
        import pulp
    except Exception:
        # Fallback: simple normalisation respecting bounds (placeholder if PuLP missing)
        w = weights_init.copy()
        # project into bounds and normalise
        if bounds:
            for a,(lo,hi) in bounds.items():
                w[a] = min(max(w.get(a,0.0), lo), hi)
        s = sum(w.values())
        return {k:v/s for k,v in w.items() if s>0}

    # Build LP: min gamma + (1/((1-alpha)*S)) * sum z_s s.t. z_s >= -r_s·w - gamma, z_s >= 0; sum w =1; bounds
    assets = list(weights_init.keys())
    S = len(scenario_paths)

    prob = pulp.LpProblem("CVaR_Min", pulp.LpMinimize)
    w = pulp.LpVariable.dicts("w", assets, lowBound=0)
    gamma = pulp.LpVariable("gamma")
    z = pulp.LpVariable.dicts("z", list(range(S)), lowBound=0)

    # Objective
    prob += gamma + (1.0 / ((1.0 - cvar_alpha) * S)) * pulp.lpSum([z[s] for s in range(S)])

    # Constraints: z_s >= - portfolio_return_s - gamma
    for s_idx, scen in enumerate(scenario_paths):
        port = pulp.lpSum([w[a] * scen.get(a,0.0) for a in assets])
        prob += z[s_idx] >= -(port) - gamma

    # Sum of weights = 1
    prob += pulp.lpSum([w[a] for a in assets]) == 1.0

    # Bounds if provided
    if bounds:
        for a,(lo,hi) in bounds.items():
            prob += w[a] >= lo
            prob += w[a] <= hi

    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    sol = {a: w[a].value() for a in assets}
    return sol


# ---- Phase 2 hooks ----
def apply_behavioral_biases(weights_target: Dict[Asset,float], persona: Dict, recent_returns: Dict[Asset,float], bias_cfg: Dict) -> Dict[Asset,float]:
    w = weights_target.copy()
    pid = persona.get("id","")
    params = bias_cfg.get("parameters",{})
    if pid in bias_cfg.get("personas",{}).get("momentum_bias",[]):
        bump = params.get("momentum_chase", 0.20)
        # overweight winners proportionally to their positive recent returns (bounded by caps later)
        pos = {a:max(0.0, r) for a,r in recent_returns.items()}
        s = sum(pos.values()) or 1.0
        for a,v in pos.items():
            w[a] = w.get(a,0.0) * (1.0 + bump * (v/s))
    if pid in bias_cfg.get("personas",{}).get("loss_aversion_bias",[]):
        draw = sum(min(0.0, r) for r in recent_returns.values())
        thr = -params.get("loss_aversion_floor", 0.12)
        if draw < -thr:  # large portfolio drawdown proxy
            shift = 0.08
            w["CASH"] = w.get("CASH",0.0) + 0.5*shift
            w["BILLS_SHORT_GILTS"] = w.get("BILLS_SHORT_GILTS",0.0) + 0.5*shift
    if pid in bias_cfg.get("personas",{}).get("property_attachment",[]):
        floor = params.get("property_attachment_floor", 0.50)
        prop = w.get("PROPERTY_UK_RESI",0.0)
        if prop < floor:
            add = min(0.05, floor - prop)
            w["PROPERTY_UK_RESI"] = prop + add
            # fund from broad equity
            take = add
            if w.get("GLOBAL_EQUITY",0.0) > take:
                w["GLOBAL_EQUITY"] -= take
    # renormalize
    s = sum(w.values()) or 1.0
    for a in list(w.keys()):
        w[a] /= s
    return w

def turnover_cost(w_prev: Dict[Asset,float], w_new: Dict[Asset,float], cost_table: Dict[Asset,float]) -> float:
    return sum(abs(w_new.get(a,0.0) - w_prev.get(a,0.0)) * cost_table.get(a,0.0) for a in set(w_prev)|set(w_new))

