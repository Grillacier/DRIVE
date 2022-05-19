from model.algorithmes.Algorithme import Algorithme

import numpy as np
from model.utils.Point import Point

class DBR(Algorithme):

    def __init__(self,robotAgent) -> None:
        # recuperation des points de controle
        Algorithme.__init__(self,robotAgent)
        self.destination = None
        self.Index = 0 # Index du point de controle

    def decision(self) -> None :
        """
        Donne un ordre au robot en fonction de la position du robot et de la destination
        """
        positionRobot = np.array([self.robotAgent.x,self.robotAgent.y])

        direction = self.getDirection(self.getDestination() - positionRobot ,self.robotAgent.getVecteurDirecteur())

        if direction == "DROITE":
            self.robotAgent.accelerer_angulaire_droite()
        elif direction == "GAUCHE" : 
            self.robotAgent.accelerer_angulaire_gauche()

        self.robotAgent.accelerer_lineaire()

        
    """
    def setControlPoint(self,controls_point) : 
        self.algorithme.setControlsPoints(controls_point)
    """


    def getDirection(self,destination,vecteur_directeur) -> str :
        """
        Permet de determiner la direction a prendre en fonction de la destination et du vecteur directeur
        """
        eps = 0.05
        angle = abs(np.arccos( (np.dot(destination,vecteur_directeur)) / (np.linalg.norm(destination) * np.linalg.norm(vecteur_directeur))))
        vecteurDirecteurTest = self.radToVectorDirector((self.robotAgent.current_radian.value + 0.1 ) % (2 * np.pi))
        angle2 = abs(np.arccos( (np.dot(destination,vecteurDirecteurTest)) / (np.linalg.norm(destination) * np.linalg.norm(vecteurDirecteurTest))))
        

        if np.abs(angle) > eps :
            if np.degrees(angle) > np.degrees(angle2) :
                return "DROITE"
            else :
                return "GAUCHE"
    
    # def getDirection(self,destination,vecteurDirecteur) -> str :
    #     eps = 0.05
    #     angle = math.atan2(destination[1], destination[0]) - math.atan2(vecteurDirecteur[1], vecteurDirecteur[0])
    #     print("angle : ",angle)
    #     if np.abs(angle) > eps :
    #         if angle < 0 :
    #             return "DROITE"
    #         else :
    #             return "GAUCHE"
    
    def calculateDestination(self) :
        """
        Calcule la destination en fonction de la position du robot et du point de controle
        """
        # si il n' ya pas de destination on prend le premier point de controle
        if self.destination is None :
            self.destination = np.array(self.robotAgent.env.circuit.controlPointsAngle[0])
            self.Index += 1
            return self.destination
        # sinon on prend le point de controle suivant lorsque le robot est proche du point de controle
        else :
            if self.getCurrentPosition().calcul_longueur(Point(self.destination[0],self.destination[1])) < 50 : # on est proche du point de controle
                self.destination = np.array(self.robotAgent.env.circuit.controlPointsAngle[self.Index % len(self.robotAgent.env.circuit.controlPointsAngle)])
                self.Index += 1
        return self.destination
    
    def setControlsPoints(self,controlsPoints) :
        """
        Permet de parametrer les points de controle
        """
        self.controlsPoints = controlsPoints
    
    def getDestination(self) :
        """
        permet de mettre a jour la destination
        """
        return self.calculateDestination()
    
    def getCurrentPosition(self) -> Point:
        """
        Retourne la position du robot
        """
        return Point(self.robotAgent.x + self.robotAgent.width/2,self.robotAgent.y +self.robotAgent.height/2)
    
    @staticmethod
    def coefDirecteurDroite(P1 , P2) :
        """
        Calcule le coefficient directeur d'une droite passant par deux points
        """
        return (P2[1] - P1[1]) / ( (P2[0] - P1[0]) +1e-10)
    
    @staticmethod
    def radToVectorDirector(value):
        return np.array([np.cos(value),np.sin(value)])
        