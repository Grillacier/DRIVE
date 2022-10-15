from model.utils.Courbe import *
import numpy as np
from shapely.geometry import Point as sPoint, Polygon
import matplotlib.pyplot as plt
import geopandas as gpd

class Route:
    # valeur d'approximation de la courbe / nombre de points créés
    APPROX_VALUE = 200
    def __init__(self, epaisseur:int, courbe:Courbe) -> None:
        self.epaisseur = epaisseur
        self.courbe = courbe
        self.calculatePoints()
        self.longeur = courbe.getLongueur(Route.APPROX_VALUE)
        tmpleft = self.LeftPoints.copy()
        tmpleft.reverse()
        self.poly = Polygon([Route.toShapelyPoint(courbe.P[0])] + self.RightPoints + tmpleft)
        # print(self.RightPoints + self.LeftPoints)
        # self.points = []
        # for r in self.LeftPoints:
        #     self.points.append(sPoint(r[0], r[1]))

        # for i, j in zip(self.RightPoints, self.LeftPoints):
        #     self.points.append(i)
        #     self.points.append(j)
        # print("self.points[0] : ", self.points[0])
        # self.poly = Polygon(self.points)

        # https://stackoverflow.com/questions/55522395/how-do-i-plot-shapely-polygons-and-objects-using-matplotlib
        # https://geopandas.org/en/stable/getting_started/install.html#installing-with-pip
        # plt.plot(*self.poly.exterior.xy)
        # p = gpd.GeoSeries(self.poly)
        # p.plot()
        # plt.show()
    
    def getRightPoints(self) -> np.array:
        """
        les points de la route à droite
        """
        return self.RightPoints
    
    def getLeftPoints(self) -> np.array:
        """
        les points de la route à gauche
        """
        return self.LeftPoints
    
    def calculatePoints(self) -> None:
        """
        calcul les points de la route
        """
        self.RightPoints = []
        self.LeftPoints = []

        f = self.epaisseur
        x = 700

        for i in range(x) :
            t = i/x
            p = self.courbe.get(t)
            d = self.courbe.getQuadraticDerivative(t) 
            m = math.sqrt(d["x"]*d["x"] + d["y"]*d["y"])
            d = { "x": d["x"]/m, "y": d["y"]/m }
            n = self.courbe.getNormal(d)
            ni = self.courbe.getInvNormal(d)

            self.RightPoints.append([p.x + f*ni["x"], p.y + f*ni["y"]])
            self.LeftPoints.append([p.x + f*n["x"], p.y + f*n["y"]])
        print("self.RightPoints[0][0] : ", self.RightPoints[0][0])
        print("self.RightPoints[0][1] : ", self.RightPoints[0][1])
        
    # ancienne version
    # def OnTheRoute(self, point:Point) -> bool:
    #     """
    #     Retourne True si le point est sur la route
    #     """
    #     for p in self.courbe.P:
    #         if p.calcul_longueur(point) < self.epaisseur:
    #             return True
    #     return False

    def OnTheRoute(self, point:Point) -> bool:
        """
        Retourne True si le point est sur la route
        """
        # print("longueur : ", point.calcul_longueur(self.courbe.P[0]))
        return Route.toShapelyPoint(point).within(self.poly) or (point.calcul_longueur(self.courbe.P[0]) <= 5.0)
            # if self.poly.contains(sp):

    def toShapelyPoints(self, l):
        """
        converts drive.Points to shapely.Points
        """
        points = []
        for x, y in l:
            points.append(sPoint(x, y))
        return points

    @staticmethod
    def toShapelyPoint(p):
        """
        converts a drive.Point to a shapely.Point
        """
        return sPoint(p.x, p.y)
