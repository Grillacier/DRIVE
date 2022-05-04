from model.utils.Courbe import *
import numpy as np

class Route:
    def __init__(self, epaisseur:int, courbe:Courbe) -> None:
        self.epaisseur = epaisseur
        self.courbe = courbe
        self.calculatePoints()
    
    def getRightPoints(self) -> np.array:
        return self.RightPoints
    
    def getLeftPoints(self) -> np.array:
        return self.LeftPoints
    
    def calculatePoints(self) -> None:
        # self.RightPoints = np.zeros((len(self.courbe.P),2))
        # self.LeftPoints = np.zeros((len(self.courbe.P),2))
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

        # PointDerivee = self.courbe.getDeriveeVector()/np.linalg.norm(self.courbe.getDeriveeVector())
        # for i in range(len(self.courbe.P)):
        #     curvePoint = self.courbe.P[i]
        #     self.RightPoints[i] = [curvePoint.getX() + self.epaisseur, curvePoint.getY() + self.epaisseur]
        #     self.LeftPoints[i] = [curvePoint.getX() - self.epaisseur, curvePoint.getY() - self.epaisseur]
        #     # self.RightPoints[i] = [PointDerivee[i,0] + curvePoint.getX(), PointDerivee[i,1] + curvePoint.getY()]
            

    