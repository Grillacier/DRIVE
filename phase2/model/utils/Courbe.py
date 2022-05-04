from model.utils.Point import *
import numpy as np
import math

def learp(p1 : Point, p2 : Point, t : int) -> Point :
    x = (1-t) * p1.x + t*p2.x
    y = (1-t) * p1.y + t*p2.y
    return Point(x,y)

class Courbe:
    def __init__(self,P0:Point,P1:Point,P2:Point) -> None:
        self.Point = [P0,P1,P2]
        self.T = [i for i in np.arange(0,1,0.001)]
        P = []
        for t in self.T:
            P.append(learp(learp(P0,P1,t),learp(P1,P2,t),t))
        self.P = P
    
    def __repr__(self) -> str:
        return f"Courbe({self.Point[0]}; {self.Point[1]}; {self.Point[2]})"
    
    def get(self,t:float) -> Point:
        return learp(learp(self.Point[0],self.Point[1],t),learp(self.Point[1],self.Point[2],t),t)
    
    # def getPointDerivee(self) -> np.array:
    #     PointDer = np.zeros((len(self.P),2))
    #     T = self.T
    #     for i in range(len(self.P)):
    #         t = T[i]
    #         tmp = learp(self.Point[1],self.Point[2],t)
    #         PointDer[i] = [tmp.getX(),tmp.getY()]
    #     return PointDer
    
    # def getPointVector(self) -> np.array:
    #     result = np.zeros((len(self.P),2))
    #     for i in range(len(self.P)):
    #         result[i] = [self.P[i].getX(),self.P[i].getY()] 
    #     return result
    
    # def getDeriveeVector(self) -> np.array:
    #     PointDer = self.getPointDerivee()
    #     result = self.getPointVector() - PointDer 
    #     return result
    
    def getQuadraticDerivative(self,t:float):
        mt = (1 - t)
        d = [{"x":2*(self.Point[1].x - self.Point[0].x),"y":2*(self.Point[1].y - self.Point[0].y)},
        {"x":2*(self.Point[2].x - self.Point[1].x),"y":2*(self.Point[2].y - self.Point[1].y)}]
        return {"x":mt * d[0]["x"] + t * d[1]["x"],"y":mt * d[0]["y"] + t * d[1]["y"]}

    @staticmethod
    def getNormal(d):
        q = math.sqrt(d["x"] * d["x"] + d["y"] * d["y"])
        return { "x": -d["y"] / q, "y": d["x"] / q }
    
    @staticmethod
    def getInvNormal(d):
        q = math.sqrt(d["x"] * d["x"] + d["y"] * d["y"])
        return { "x": d["y"] / q, "y": -d["x"] / q }
    
    def getLongueur(self,approximation_step:int) -> float:
        dist = 0
        
        for i in range(1,approximation_step):
            tMinus = (i-1)/approximation_step
            t = i/approximation_step
            pMinus = self.get(tMinus)
            p = self.get(t)
            dist += math.sqrt((p.x - pMinus.x)**2 + (p.y - pMinus.y)**2)
        
        return dist
    
    def getDistance(self,distance:float,approximation_step:int) -> Point:
        dist = 0
        for i in range(1,approximation_step):
            tMinus = (i-1)/approximation_step
            t = i/approximation_step
            pMinus = self.get(tMinus)
            p = self.get(t)
            dist += math.sqrt((p.x - pMinus.x)**2 + (p.y - pMinus.y)**2)
            if dist >= distance:
                return p
        return None
        

    
