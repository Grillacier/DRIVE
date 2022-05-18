from model.utils.Courbe import *
import numpy as np

class Route:
    # valeur d'approximation de la courbe / nombre de points créés
    APPROX_VALUE = 200
    def __init__(self, epaisseur:int, courbe:Courbe) -> None:
        self.epaisseur = epaisseur
        self.courbe = courbe
        self.calculatePoints()
        self.longeur = courbe.getLongueur(Route.APPROX_VALUE)
    
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
        
    def OnTheRoute(self, point:Point) -> bool:
        """
        Retourne True si le point est sur la route
        """
        for p in self.courbe.P:
            if p.calcul_longueur(point) < self.epaisseur:
                return True
        return False

    