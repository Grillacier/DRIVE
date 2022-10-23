from model.algorithmes.Algorithme import Algorithme

import numpy as np

import time

from model.utils.Point import Point

class DBRAVirage(Algorithme):

    nbResearch = 0

    def __init__(self,robotAgent) -> None:
        # recuperation des points de controle
        Algorithme.__init__(self,robotAgent)
        self.destination = None
        self.Index = 0 # Index du point de controle

        
        self.list_time_tour = []
        self.current_time = time.time()

        self.out = False

        self.position_robot = self.robotAgent.getPosition()

        # bool pour savoir si le robot est sorti du circuit
        self.inside = True
        self.onCircuit = True


    def decision(self):
        """
        Donne un ordre au robot en fonction de la position du robot et de la destination
        """
        self.position_robot = self.robotAgent.getPosition()

        positionRobot = np.array([self.robotAgent.x,self.robotAgent.y])

        direction = self.getDirection(self.getDestination() - positionRobot, self.robotAgent.getVecteurDirecteur())

        if direction == "DROITE":
            self.robotAgent.accelerer_angulaire_droite()
        elif direction == "GAUCHE" : 
            self.robotAgent.accelerer_angulaire_gauche()
        
        if self.getCurrentPosition().calcul_longueur(Point(self.destination[0],self.destination[1])) > 80 : 
            self.robotAgent.accelerer_lineaire()
            #print("accélération")
        else : 
            self.robotAgent.decelerer_lineaire()
            #print("déceleration")

        # renvoie true si le robot n'a pas quitte le circuit, false sinon 
        return self.inside


    """
    Verifie si le robot est proche d'un point
    """
    def isCloseToLastPoint(self):
        threshold = 20
        last_pt = self.robotAgent.env.circuit.controlPointsAngle[-1]
        ax, ay = (self.position_robot.getX()), (self.position_robot.getY())
        bx, by = last_pt[0], last_pt[1]
        dist = np.sqrt((bx-ax)**2 + (by-ay)**2)
        if dist <= threshold and self.robotAgent.env.getCircuit().OnTheCircuit(self.position_robot):
            return True
        else:
            return False

    def isCloseToPoint(self, pt):
        threshold = 10
        ax, ay = (self.position_robot.getX()), (self.position_robot.getY())
        bx, by = pt[0], pt[1]
        dist = np.sqrt((bx-ax)**2 + (by-ay)**2)
        if dist <= threshold and self.robotAgent.env.getCircuit().OnTheCircuit(self.position_robot):
            return True
        else:
            return False

    # calcul un angle entre 2 vecteurs
    def angle(self, x2, y2, x1, y1):
        dot = x1*x2 + y1*y2
        det = x1*y2 - y1*x2
        angle = np.arctan2(det, dot)
        return abs(angle)

    def getDirection(self,destination,vecteur_directeur) -> str :
        """
        Permet de determiner la direction a prendre en fonction de la destination et du vecteur directeur
        """
        eps = 0.05
        angle = self.angle(destination[0], destination[1], vecteur_directeur[0], vecteur_directeur[1])
        vecteurDirecteurTest = self.radToVectorDirector((self.robotAgent.current_radian.value + 0.1 ) % (2 * np.pi))
        angle2 = self.angle( destination[0], destination[1], vecteurDirecteurTest[0], vecteurDirecteurTest[1])

        if np.abs(angle) > eps :
            if np.degrees(angle) > np.degrees(angle2) :
                return "DROITE"
            else :
                return "GAUCHE"
    
    def calculateDestination(self) :
        """
        Calcule la destination en fonction de la position du robot et du point de controle
        """
        # s'il n' ya pas de destination on prend le premier point de controle
        if self.destination is None :
            self.destination = np.array(self.robotAgent.env.circuit.controlPointsAngle[0])
            self.Index += 1
            return self.destination
        # sinon on prend le point de controle suivant lorsque le robot est proche du point de controle
        else :
            
            if self.getCurrentPosition().calcul_longueur(Point(self.destination[0],self.destination[1])) < 40 : # on est proche du point de controle
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

    def setInside(self, inside):
        self.inside = inside

    def setOnCircuit(self, on):
        self.onCircuit = on
        self.setInside(on and self.inside)
    
    @staticmethod
    def coefDirecteurDroite(P1 , P2) :
        """
        Calcule le coefficient directeur d'une droite passant par deux points
        """
        return (P2[1] - P1[1]) / ( (P2[0] - P1[0]) +1e-10)
    
    @staticmethod
    def radToVectorDirector(value):
        return np.array([np.cos(value),np.sin(value)])