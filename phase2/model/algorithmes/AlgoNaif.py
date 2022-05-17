from model.algorithmes.Algorithme import Algorithme
from model.utils.Point import Point

import math
import numpy as np

"""
Algorithme de démonstration qui fait avancer le robot tout droit
"""
class AlgoNaif(Algorithme):

    DESTINATION = np.array([100,300])

    def __init__(self,robotAgent) -> None:
        Algorithme.__init__(self,robotAgent)
        self.destination = None
        self.Index = 0 # Index du point de controle

    def decision(self) -> None :
        positionRobot = np.array([self.robotAgent.x,self.robotAgent.y])

        direction = self.getDirection(self.getDestination() - positionRobot,self.robotAgent.getVecteurDirecteur())

        if direction == "DROITE":
            self.robotAgent.accelerer_angulaire_droite()
        elif direction == "GAUCHE" : 
            self.robotAgent.accelerer_angulaire_gauche()

        self.robotAgent.accelerer_lineaire()

    def getDirection(self,destination,vecteurDirecteur) :      
        # a1 = self.coefDirecteurDroite([self.robotAgent.x,self.robotAgent.y],self.getDestination())
        # a2 = self.coefDirecteurDroite([0,0],vecteurDirecteur)

        # alpha = np.degrees(np.arctan((a2 - a1)/(1 + (a1 * a2))))
        # print("alpha : ",alpha)

        eps = 0.05
        
        angle = math.atan2(destination[1], destination[0]) - math.atan2(vecteurDirecteur[1], vecteurDirecteur[0])
        print("angle : ",angle)
        if np.abs(angle) > eps :
            if angle < 0 :
                return "DROITE"
            else :
                return "GAUCHE"
        else :
            return None
    
    def calculateDestination(self) :
        if self.destination is None :
            self.destination = np.array(self.controlsPoints[0])
            self.Index += 1
            return self.destination
        else :
            if self.getCurrentPosition().calcul_longueur(Point(self.destination[0],self.destination[1])) < 40 :
                self.destination = np.array(self.controlsPoints[self.Index % len(self.controlsPoints)])
                self.Index += 1
        return self.destination
    
    def setControlsPoints(self,controlsPoints) :
        self.controlsPoints = controlsPoints
    
    def getDestination(self) :
        return self.calculateDestination()
    
    def getCurrentPosition(self) -> Point:
        return Point(self.robotAgent.x + self.robotAgent.width/2,self.robotAgent.y +self.robotAgent.height/2)
    
    @staticmethod
    def coefDirecteurDroite(P1 , P2) :
        return (P2[1] - P1[1]) / ( (P2[0] - P1[0]) +1e-10)
    