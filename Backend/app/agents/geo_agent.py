import json
import os
# pyrefly: ignore [missing-import]
from ..schemas.agent import GeoAgentRequest, GeoAgentResponse

def get_context(request: GeoAgentRequest) -> GeoAgentResponse:
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        assets_path = os.path.join(base_dir, 'data', 'assets.json')
        
        if os.path.exists(assets_path):
            with open(assets_path, 'r') as f:
                assets = json.load(f)
                
            for asset in assets:
                if abs(asset.get('lat', 0) - request.lat) < 0.001 and abs(asset.get('lon', 0) - request.lon) < 0.001:
                    return GeoAgentResponse(
                        population_affected=asset.get('population', 5),
                        criticality=asset.get('criticality', 0.5),
                        accessibility=asset.get('accessibility', 0.5),
                        flood_zone=asset.get('flood_zone', False)
                    )
                    
        return GeoAgentResponse(
            population_affected=5,
            criticality=0.4,
            accessibility=0.6,
            flood_zone=True
        )
    except Exception as e:
        print(f"Geo Agent Error: {e}")
        return GeoAgentResponse(
            population_affected=5,
            criticality=0.4,
            accessibility=0.6,
            flood_zone=True
        )
