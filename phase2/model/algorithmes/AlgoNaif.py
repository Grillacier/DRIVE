from model.algorithmes.Algorithme import Algorithme

import math
import numpy as np

"""
Algorithme de démonstration qui fait avancer le robot tout droit
"""
class AlgoNaif(Algorithme):

    DESTINATION = np.array([0,1000])

    def __init__(self,robotAgent) -> None:
        Algorithme.__init__(self,robotAgent)

    def decision(self) -> None :
        positionRobot = np.array([self.robotAgent.x,self.robotAgent.y])

        direction = self.getDirection(AlgoNaif.DESTINATION - positionRobot,self.robotAgent.getVecteurDirecteur())

        if direction == "DROITE":
            self.robotAgent.accelerer_angulaire_droite()
        elif direction == "GAUCHE" : 
            self.robotAgent.accelerer_angulaire_gauche()
        
        self.robotAgent.accelerer_lineaire()


    def getDirection(self,destination,vecteurDirecteur) :

        eps = 1e-3
        
        angle = math.atan2(destination[1], destination[0]) - math.atan2(vecteurDirecteur[1], vecteurDirecteur[0])
        if np.abs(angle) > eps :
            if angle < 0 :
                return "DROITE"
            else :
                return "GAUCHE"
        else :
            return None