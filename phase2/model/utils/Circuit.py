from model.utils.Route import *
import numpy as np

class Circuit:
    # Division de la route en segments
    CIRCUIT_DIVISION = 30
    ANGLE_DIVISION = 10
    def __init__(self, routes:list) -> None:
        self.routes = routes
        self.longeur = round(sum([route.longeur for route in routes]),2)
        self.startPoint = routes[0].courbe.get(0)

    def getControlPointsT(self) -> np.array:
        """
        Recupertation des points de controle en fonction de la valeur de t pour chaque route/courbe
        """
        result = np.zeros((Circuit.CIRCUIT_DIVISION,2))
        step = np.linspace(0,len(self.routes),Circuit.CIRCUIT_DIVISION,endpoint=False)
        i = 0
        for T in step:
            t = T % 1
            result[i] = [self.routes[int(T)].courbe.get(t).x, self.routes[int(T)].courbe.get(t).y]
            i += 1
        return result
    
    def getControlPointsDist(self) -> np.array:
        """
        Recupertation des points de controle en fonction de la distance 
        """
        result = np.zeros((Circuit.CIRCUIT_DIVISION,2))
        step = np.linspace(0,int(self.longeur),Circuit.CIRCUIT_DIVISION,endpoint=False)
        i = 0
        for s in step:
            tmp = self.getPointFromStart(s)
            result[i] = [tmp.x,tmp.y]
            i += 1
        return result
    
    def getControlPointsAngle(self) -> np.array:
        """
        Recupertation des points de controle en fonction de l'angle
        """
        result = []
        step = np.linspace(0,len(self.routes),len(self.routes)*Route.APPROX_VALUE,endpoint=False)
        prec = self.routes[0].courbe.getNormalizedQuadraticDerivative(0)
        for T in step:
            if(T == 0):
                continue
            t = T % 1
            tmp = self.routes[int(T)].courbe.getNormalizedQuadraticDerivative(t)
            # print("t",t,"tmp",tmp,"prec",prec)
            # x = math.sqrt(prec["x"]**2 + prec["y"]**2)
            # y =  math.sqrt(tmp["x"]**2 + tmp["y"]**2)
            # z = (prec["x"]*tmp["x"] + prec["y"]*tmp["y"])
            # print(z/(x*y))
            #angle = math.degrees(math.acos((prec["x"]*tmp["x"] + prec["y"]*tmp["y"])/(math.sqrt(prec["x"]**2 + prec["y"]**2) * math.sqrt(tmp["x"]**2 + tmp["y"]**2))))
            try:
                angle = math.degrees(math.acos((np.dot([prec["x"],prec["y"]],[tmp["x"],tmp["y"]]))/(math.sqrt(prec["x"]**2 + prec["y"]**2) * math.sqrt(tmp["x"]**2 + tmp["y"]**2))))
            except:
                angle = 0
            if angle >= Circuit.ANGLE_DIVISION:
                p = self.routes[int(T)].courbe.get(t)
                result.append([p.x, p.y])
                prec = tmp
        
        return np.array(result)

    
    def getPointFromStart(self,distance:float) -> Point:
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
        
    # def getDistance(self,point1:Point,point2:Point) -> Point:
        
    
    # def getPointFromPoint(self,point:Point,distance:float) -> Point:
    #     d = self.getDistance(self.startPoint,point)
    #     route = None
    #     for i in range(len(self.routes)):
    #         tmp = self.routes[i].longeur + d
    #         if (distance < tmp and distance >= d):
    #             route = self.routes[i]
    #             break
    #         d = tmp
        
    #     # on cherche le point sur la courbe
    #     if route is None:
    #         raise Exception("distance trop grande")
    #     d = (distance - d)
    #     return route.courbe.getDistance(d,100)

