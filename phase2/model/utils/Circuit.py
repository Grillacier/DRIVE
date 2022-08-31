from model.utils.Route import *
import numpy as np

class Circuit:
    # Division de la route en segments
    CIRCUIT_DIVISION = 30
    # Angle entre deux points pour la division du circuit
    ANGLE_DIVISION = 10
    def __init__(self, routes:list) -> None:
        self.routes = routes
        self.longueur = round(sum([route.longeur for route in routes]),2)
        self.startPoint = routes[0].courbe.get(0)
        self.controlPointsAngle = self.getControlPointsAngle()
        # peu parfois provoquer des problème de calculs avec les points de controle
        #self.controlPointsDist = self.getControlPointsDist()
        #self.controlPointsT = self.getControlPointsT()

    def getControlPointsT(self) -> np.array:
        """
        Recuperation des points de controle en fonction de la valeur de t pour chaque route/courbe
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
        Recuperation des points de controle en fonction de la distance 
        """
        result = np.zeros((Circuit.CIRCUIT_DIVISION,2))
        step = np.linspace(0,int(self.longueur),Circuit.CIRCUIT_DIVISION,endpoint=False)
        i = 0
        for s in step:
            tmp = self.getPointFromStart(s)
            result[i] = [tmp.x,tmp.y]
            i += 1
        return result
    
    # TODO : traiter le cas des circuits contenant plus de 2 points bleus clairs
    def getControlPointsAngle(self) -> np.array:
        """
        Recuperation des points de controle en fonction de l'angle
        """
        result = []
        step = np.linspace(0,len(self.routes),len(self.routes)*Route.APPROX_VALUE,endpoint=False)
        prec = self.routes[0].courbe.getNormalizedQuadraticDerivative(0)
        p = self.routes[0].courbe.get(0)
        result.append([p.x, p.y])
        for T in step:
            if(T == 0):
                continue
            t = T % 1
            tmp = self.routes[int(T)].courbe.getNormalizedQuadraticDerivative(t)
            try:
                angle = math.degrees(math.acos((np.dot([prec["x"],prec["y"]],[tmp["x"],tmp["y"]]))/(math.sqrt(prec["x"]**2 + prec["y"]**2) * math.sqrt(tmp["x"]**2 + tmp["y"]**2))))
            except:
                angle = 0
            if angle >= Circuit.ANGLE_DIVISION:
                p = self.routes[int(T)].courbe.get(t)
                result.append([p.x, p.y])
                prec = tmp
        p = self.routes[0].courbe.get(1)
        result.append([p.x, p.y])
        return np.array(result)

    # ancienne version
    # def getControlPointsAngle(self) -> np.array:
    #     """
    #     Recupertation des points de controle en fonction de l'angle
    #     """
    #     result = []
    #     step = np.linspace(0,len(self.routes),len(self.routes)*Route.APPROX_VALUE,endpoint=False)
    #     prec = self.routes[0].courbe.getNormalizedQuadraticDerivative(0)
    #     for T in step:
    #         if(T == 0):
    #             continue
    #         t = T % 1
    #         tmp = self.routes[int(T)].courbe.getNormalizedQuadraticDerivative(t)
    #         try:
    #             angle = math.degrees(math.acos((np.dot([prec["x"],prec["y"]],[tmp["x"],tmp["y"]]))/(math.sqrt(prec["x"]**2 + prec["y"]**2) * math.sqrt(tmp["x"]**2 + tmp["y"]**2))))
    #         except:
    #             angle = 0
    #         if angle >= Circuit.ANGLE_DIVISION:
    #             p = self.routes[int(T)].courbe.get(t)
    #             result.append([p.x, p.y])
    #             prec = tmp
        
    #     return np.array(result)

    
    def getPointFromStart(self,distance:float) -> Point:
        """
        Permet de recuperer un point sur la courbe à une distance donnee
        """
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

    def addControlPointsAngle(self, p):
        liste = self.controlPointsAngle.tolist() + [[p.getX(), p.getY()]]
        self.controlPointsAngle = np.array(liste)

    def insertControlPointsAngle(self, p):
        liste = [[p.getX(), p.getY()]] + self.controlPointsAngle.tolist()
        self.controlPointsAngle = np.array(liste)

    def calculateCenter(self) -> Point:
        """
        calcul du centre du circuit
        """
        res = Point(0,0)
        nb_point = 0
        for route in self.routes:
            for point in route.courbe.Point:
                nb_point += 1
                res.x += point.x
                res.y += point.y
        res.x /= nb_point
        res.y /= nb_point
        return res
    
    def OnTheCircuit(self,point:Point) -> bool:
        """
        Permet de savoir si un point est sur le circuit
        """
        for route in self.routes:
            if route.OnTheRoute(point):
                return True
    


