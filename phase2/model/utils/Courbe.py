import os 
import sys
file_path = os.path.abspath(__file__).split("/Courbe.py")[0]
root_projet_path = file_path.split("model")[0]
print(file_path)
print(root_projet_path)
os.chdir(root_projet_path)
sys.path.insert(0,root_projet_path)

from model.utils.Point import *
import numpy as np
import math
from pymunk.vec2d import Vec2d
from matplotlib.lines import Line2D


class Courbe:
    def __init__(self,P0:Point,P1:Point,P2:Point) -> None:
        self.Point = [P0,P1,P2]
        self.T = [i for i in np.arange(0,1,0.001)]
        self.P = self.tmpNameIterative(P0, P1, P2, 0.1745329)

    # ancienne version
    # def __init__(self,P0:Point,P1:Point,P2:Point) -> None:
    #     self.Point = [P0,P1,P2]
    #     self.T = [i for i in np.arange(0,1,0.001)]
    #     P = []
    #     for t in self.T:
    #         P.append(self.learp(self.learp(P0,P1,t),self.learp(P1,P2,t),t))
    #     self.P = P

    def __repr__(self) -> str:
        return f"Courbe({self.Point[0]} {self.Point[1]} {self.Point[2]})"
    
    def get(self,t:float) -> Point:
        """
        Recupere le point correspondant a la courbe pour un t donne
        """
        return self.learp(self.learp(self.Point[0],self.Point[1],t),self.learp(self.Point[1],self.Point[2],t),t)
    
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
        """
        Permet de calculer la derivee de la courbe en un point donne
        """
        mt = (1 - t)
        d = [{"x":2*(self.Point[1].x - self.Point[0].x),"y":2*(self.Point[1].y - self.Point[0].y)},
        {"x":2*(self.Point[2].x - self.Point[1].x),"y":2*(self.Point[2].y - self.Point[1].y)}]
        return {"x":mt * d[0]["x"] + t * d[1]["x"],"y":mt * d[0]["y"] + t * d[1]["y"]}
    
    def getNormalizedQuadraticDerivative(self,t:float):
        """
        Permet de calculer le vecteur normalise de la derivee de la courbe en un point donne
        """
        d = self.getQuadraticDerivative(t) 
        m = math.sqrt(d["x"]*d["x"] + d["y"]*d["y"])
        d = { "x": d["x"]/m, "y": d["y"]/m }
        return d

    @staticmethod
    def getNormal(d):
        """
        Calcule le vecteur normal a un vecteur donne
        """
        q = math.sqrt(d["x"] * d["x"] + d["y"] * d["y"])
        return { "x": -d["y"] / q, "y": d["x"] / q }
    
    @staticmethod
    def getInvNormal(d):
        """
        Calcule le vecteur inverse normal a un vecteur donne
        """
        q = math.sqrt(d["x"] * d["x"] + d["y"] * d["y"])
        return { "x": d["y"] / q, "y": -d["x"] / q }
    
    def getLongueur(self,approximation_step:int) -> float:
        """
        Calcule la longueur de la courbe en utilisant la methode de l'approximation de la longueur
        """
        dist = 0
        
        for i in range(1,approximation_step):
            tMinus = (i-1)/approximation_step
            t = i/approximation_step
            pMinus = self.get(tMinus)
            p = self.get(t)
            dist += math.sqrt((p.x - pMinus.x)**2 + (p.y - pMinus.y)**2)
        
        return dist
    
    def getDistance(self,distance:float,approximation_step:int) -> Point:
        """
        Calcule le point de la courbe a une distance donnee 
        Attention : la distance doit etre positive
        appoximation_step est le nombre de points utilises pour approximer la longueur
        """
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
    
    @staticmethod
    def learp(p1 : Point, p2 : Point, t : int) -> Point :
        """
        permet de calculer le point d'interpolation entre p1 et p2 à une distance t
        t doit etre compris entre 0 et 1
        """
        x = (1-t) * p1.x + t*p2.x
        y = (1-t) * p1.y + t*p2.y
        return Point(x,y)
        

# https://vorg.github.io/pex/docs/pex-geom/Vec2.html
# http://www.pymunk.org/en/latest/pymunk.vec2d.html

    def tmpNameIterative(self, point1, point2, point3, ceil = 2):
        toProcess = [[Vec2d(point1.x, point1.y), Vec2d(point2.x, point2.y), Vec2d(point3.x, point3.y)]]
        acc = []
        first = True
        angele = 0
        elem = toProcess.pop(0)

        while len(toProcess) != 0 or elem is not None:
            p1 = elem[0]
            p2 = elem[1]
            p3 = elem[2]
            angele = self.angle(p1, p2, p3)
            if(abs(angele) >= ceil):
                newPoint = self.subdivide(p1, p2, p3)
                toProcess.insert(0, [newPoint[0],newPoint[1],newPoint[2]])
                toProcess.insert(1, [newPoint[2],newPoint[3],newPoint[4]])
            
            else:
                if(len(acc) == 0):
                    #The values must be inserted at the end of the list
                    acc.append(p1)
                    acc.append(p2)
                    acc.append(p3)
                else:
                    acc.append(p2)  
                    acc.append(p3)     
            elem = None if len(toProcess) == 0 else toProcess.pop(0)
        return Courbe.vecToPoint(acc)

    def vecToPoint(acc):
        """
        converts a Vec2d to a Point
        """
        newAcc = []
        for v in acc:
            newAcc.append(Point(v.x, v.y))
        return newAcc


    def angle(self, prevpoint, point, nextpoint):
        tmp1 = self.get2pointPerpendicular(point, prevpoint, 2)
        tmp2 = self.get2pointPerpendicular(nextpoint, point, 2)
        return tmp1.get_angle_between(tmp2)

    def get2pointPerpendicular(self, point, otherpoint, length):
        pt = Vec2d(point.x, point.y)
        pt2 = Vec2d(otherpoint.x, otherpoint.y)
        scaledP2 = Vec2d(pt2.perpendicular().x * length, pt2.perpendicular().y * length)
        return pt - pt2.perpendicular() if length is None else pt - scaledP2

    @staticmethod
    def subdivide(point1, controlPoint, point2):
        # The subdivide function will probably need to keep all the composant of the Section, since a subdivision must occur on both side of the road
        t = Courbe.getNearestPoint(Vec2d(point1.x, point1.y), Vec2d(controlPoint.x, controlPoint.y), Vec2d(point2.x, point2.y))
        pt = Courbe.getBezierXY(t, point1.x, point1.y, controlPoint.x, controlPoint.y, point2.x, point2.y)
        pt = Vec2d(pt.x, pt.y)
        scaledP1 = Vec2d(point1.x * (1-t), point1.y * (1-t))
        scaledP2 = Vec2d(point2.x * t, point2.y * t)
        scaledCtrlPoint = Vec2d(controlPoint.x * t, controlPoint.y * t)
        scaledCtrlPoint2 = Vec2d(controlPoint.x * (1-t), controlPoint.y * (1-t))
        t1 = scaledP1 + scaledCtrlPoint
        t2 = scaledCtrlPoint2 + scaledP2
        vt = t1 - t2
        vt = Courbe.normalizeTo(vt, 40)
        newControl1 = Courbe.intersectLine(point1, controlPoint, pt, pt+vt)
        newControl2 = Courbe.intersectLine(point2, controlPoint, pt, pt+vt)
        return [point1, newControl1, pt, newControl2, point2]

    def intersectLine(p1, p2, p3, p4):
        isec = None
        denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
        na = (p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)
        nb = (p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)
        if (denom != 0):
            ua = na / denom
            ub = nb / denom
            isec = Courbe.interpolateTo(p1, p2, ua)
        return isec

    def interpolateTo(v1, v2, f):
        return Vec2d(v1.x + (v2.x - v1.x) * f, v1.y + (v2.y - v1.y) * f)

    def normalizeTo(vec, len):
        mag = math.sqrt(vec.x * vec.x + vec.y * vec.y)
        if (mag > 0):
            mag = len / mag
            newVec = Vec2d(vec.x*mag, vec.y*mag)
        return newVec

    @staticmethod
    def getNearestPoint(p1, pc, p2):
        v0 = pc - p1
        v1 = p2 - pc
        a = (v1 - v0).dot(v1-v0)
        b = 3 * (v1.dot(v0) - v0.dot(v0))
        c = 3 * v0.dot(v0) - v1.dot(v0)
        d = -1 * v0.dot(v0)
        p = -b / (3 * a)
        q = p * p * p + (b * c - 3 * a * d) / (6 * a * a)
        r = c / (3 * a)
        tmp = math.pow(r - p * p, 3)
        s = math.sqrt(abs(q * q + tmp))
        t = Courbe.cbrt(q + s) + Courbe.cbrt(q - s) + p
        return t

    # cubic root
    def cbrt(x):
        if x < 0:
            x = abs(x)
            cube_root = x**(1/3)*(-1)
        else:
            cube_root = x**(1/3)
        return cube_root

    def getBezierXY(t, sx, sy, cp1x, cp1y, ex, ey):
        x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex
        y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
        return Point(x, y)