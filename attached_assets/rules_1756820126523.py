from models import PersonaDef

def normalise(a:dict)->dict:
    s=sum(a.values()) or 1.0
    return {k:max(0.0,v/s) for k,v in a.items()}

def apply_persona_rules(base_alloc:dict, persona:PersonaDef, scen_id:str, tech_crypto_corr:float=0.0)->dict:
    a=base_alloc.copy()

    min_liq = max(0.10, 0.02*persona.liquidity_months)
    liq = a.get("CASH",0)+a.get("GILTS_SHORT",0)
    if liq < min_liq:
        delta=min_liq-liq
        a["CASH"]=a.get("CASH",0)+delta*0.6
        a["GILTS_SHORT"]=a.get("GILTS_SHORT",0)+delta*0.4
        for k in ["CRYPTO_ALT","CRYPTO_ETH","CRYPTO_BTC","GROWTH_TECH","PROPERTY_UK_RESI","UK_REITs"]:
            if delta<=0: break
            cut=min(a.get(k,0), delta/6); a[k]=a.get(k,0)-cut; delta-=cut

    cap = 0.30 if persona.concentration_tolerance!="high" else 0.40
    for k,v in list(a.items()):
        if v>cap:
            excess=v-cap; a[k]=cap; a["CASH"]=a.get("CASH",0)+excess

    if persona.id=="P016":
        hard_cap = 0.65
        if a.get("PROPERTY_UK_RESI",0) > hard_cap:
            excess = a["PROPERTY_UK_RESI"] - hard_cap
            a["PROPERTY_UK_RESI"] = hard_cap
            a["GILTS_SHORT"] = a.get("GILTS_SHORT",0) + 0.6*excess
            a["GOLD"] = a.get("GOLD",0) + 0.4*excess
        if scen_id in ["gilt_selloff","stagflation","property_crash"]:
            cap_stress = 0.45
            if a.get("PROPERTY_UK_RESI",0) > cap_stress:
                excess = a["PROPERTY_UK_RESI"] - cap_stress
                a["PROPERTY_UK_RESI"] = cap_stress
                a["CASH"] = a.get("CASH",0) + 0.5*excess
                a["GILTS_SHORT"] = a.get("GILTS_SHORT",0) + 0.5*excess

    if scen_id=="tech_burst" and (persona.id=="P003" or persona.tech_bias>0.6):
        a["CRYPTO_BTC"] = min(a.get("CRYPTO_BTC",0), 0.15)
        a["CRYPTO_ETH"] = min(a.get("CRYPTO_ETH",0), 0.10)
        a["CRYPTO_ALT"] = min(a.get("CRYPTO_ALT",0), 0.05)
        if tech_crypto_corr >= 0.80:
            shift = 0.05
            for k in ["CRYPTO_ALT","CRYPTO_ETH","CRYPTO_BTC"]:
                cut=min(a.get(k,0), shift); a[k]=a.get(k,0)-cut
                a["UK_EQUITY_VALUE"]=a.get("UK_EQUITY_VALUE",0)+0.6*cut
                a["CASH"]=a.get("CASH",0)+0.4*cut

    coll_total = sum(a.get(k,0) for k in a if k.startswith("COLLECTIBLES_"))
    max_coll = 0.05 if persona.wealth_band.startswith("Entry") or persona.wealth_band.startswith("Mass") else 0.10
    if coll_total>max_coll:
        excess = coll_total - max_coll
        for k in ["COLLECTIBLES_CARS","COLLECTIBLES_WATCHES","COLLECTIBLES_JEWELLERY",
                  "COLLECTIBLES_WHISKY","COLLECTIBLES_ART","COLLECTIBLES_WINE"]:
            cut=min(a.get(k,0), excess)
            a[k]=a.get(k,0)-cut; a["CASH"]=a.get("CASH",0)+cut; excess-=cut
            if excess<=0: break

    return normalise(a)
