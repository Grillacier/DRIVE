from model.utils.Route import *
import numpy as np

class Circuit:
    CIRCUIT_DIVISION = 30
    def __init__(self, routes:list) -> None:
        self.routes = routes
        self.longeur = round(sum([route.longeur for route in routes]),2)

    def getControlPointsT(self) -> np.array:
        result = np.zeros((Circuit.CIRCUIT_DIVISION,2))
        step = np.linspace(0,len(self.routes),Circuit.CIRCUIT_DIVISION,endpoint=False)
        i = 0
        for T in step:
            t = T % 1
            result[i] = [self.routes[int(T)].courbe.get(t).x, self.routes[int(T)].courbe.get(t).y]
            i += 1
        return result
    
    def getDistance(self,distance:float) -> Point:
        # on cherche sur quelle courbe ce trouve le point a la distance
        d = 0
        route = None
        for i in range(len(self.routes)):
            tmp = self.routes[i].longeur + d
            if (distance < tmp and distance >= d):
                route = self.routes[i]
                break
            d = tmp
        
        # on cherche le point sur la courbe
        if route is None:
            raise Exception("distance trop grande")
        d = (distance - d)
        return route.courbe.getDistance(d,100)
                

