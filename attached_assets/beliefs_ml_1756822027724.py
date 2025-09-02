import math
def ml_weight_update(base_probs:dict, features:dict):
    adj = base_probs.copy()
    score_pc = -1.0*(features.get('pci',0.5)-0.5) - 0.8*(features.get('psi',0.5)-0.5)
    adj['property_crash'] *= (1 + 0.5*score_pc)
    score_stag = (features.get('inf',0.5)-0.5) + 0.3*(features.get('eng',0.5)-0.5)
    adj['stagflation'] *= (1 + 0.5*score_stag)
    score_fx = (features.get('fxv',0.5)-0.5)
    adj['devaluation'] *= (1 + 0.7*score_fx)
    tot = sum(adj.values()) or 1.0
    return {k: max(0.01, v)/tot for k,v in adj.items()}
