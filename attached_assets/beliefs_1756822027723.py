from collections import defaultdict
import math

def _standardize(z):
    vals=list(z.values()) or [0.0]; m=sum(vals)/len(vals)
    v=sum((x-m)**2 for x in vals)/len(vals); s=(v**0.5) or 1.0
    return {k:(v-m)/s for k,v in z.items()}
def _sig(x): return 1/(1+math.exp(-x))

def infer_latent_indices(responses:dict, qmap:dict)->dict:
    z=defaultdict(float)
    for qid,ans in responses.items():
        opt=qmap.get(qid,{}).get("options",{}).get(ans,{})
        for tag,w in opt.get("tags",{}).items(): z[tag]+=w
    zs=_standardize(z)
    return {
      "psi": _sig(zs.get("property_conf", -zs.get("property_caution",0))),
      "pci": _sig(zs.get("pci",0)),
      "inf": _sig(zs.get("inflation_sens",0)),
      "tech":_sig(zs.get("tech_conv",0)),
      "fxv": _sig(zs.get("fxv",0)),
      "eng": _sig(zs.get("energy_risk",0)),
      "rate":_sig(zs.get("rate_sens",0)),
      "rt":  _sig(zs.get("risk_tol",0)),
    }

def scenario_probabilities(responses:dict,qmap:dict,latent:dict)->dict:
    from collections import defaultdict
    raw=defaultdict(float)
    for qid,ans in responses.items():
        for s,w in qmap.get(qid,{}).get("options",{}).get(ans,{}).get("scenarios",{}).items():
            raw[s]+=w
    raw["property_crash"]*= (1.3 if latent["pci"]<0.4 and latent["psi"]<0.5 else 0.9 if latent["psi"]>0.6 else 1.0)
    raw["stagflation"]   *= (1.2 if latent["inf"]>0.6 or latent["eng"]>0.6 else 1.0)
    raw["devaluation"]   *= (1.3 if latent["fxv"]>0.6 else 1.0)
    raw["reflation"]     *= (1.2 if latent["pci"]>0.6 else 0.9)
    raw["gilt_selloff"]  *= (1.2 if latent["rate"]>0.6 and latent["pci"]<0.5 else 1.0)
    floor=0.05
    keys=["property_crash","ai_recession","stagflation","tech_burst","tax_shift",
          "reflation","stagflation_2","devaluation","gilt_selloff","energy_spike"]
    for k in keys: raw[k]=max(raw.get(k,0.0),floor)
    tot=sum(raw.values()); return {k:raw[k]/tot for k in keys}
