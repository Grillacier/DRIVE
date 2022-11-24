from cmath import sqrt
import math
import string
from tokenize import Pointfloat
from model.RobotAgent import RobotAgent
from model.utils.Point import Point
from model.utils.Droite import Droite
from model.utils.Courbe import Courbe
import threading
import time
import pygame
import os
import numpy as np

class Environment :
    """
    Modèle de l'appli / point d'entrée des requêtes à faire sur les éléments du modèle
    """
    height = 1000
    width = 1000
    # filename = os.path.dirname(os.path.abspath(__file__))+"/circuit/45-29.txt"

    def __init__(self, filename) -> None:
        self.road = Environment.importRoadFromFile(filename)

        middle_x_robotAgent = (Environment.width/2) - (RobotAgent.width/2)
        self.robotAgent = RobotAgent(self)
        self.thread = ModelThread(self)
        """
        self.road : liste de points triplet [(P1 : Point,Pc : Point, P2 : Point)_1,...,(P1 : Point,Pc : Point, P2 : Point)_n]
        A voir comment on va representer la route ...
        """

        self.circuit = None

    def update(self) -> None :
        self.robotAgent.update()

    def start(self) -> None :
        """
        Lance le thread du modele qui fait evoluer le modele
        """
        self.thread.start()

    def stop(self) -> None :
        """
        Stop le thread de mise à jour du modele
        """
        print("Arret de l'environnement")
        self.thread.setCondition(False)

    def getRobotAgent(self) -> RobotAgent :
        """
        Retourne le robot
        """
        return self.robotAgent
    
    def getCircuit(self) :
        return self.circuit
    
    def setCircuit(self,circuit) :
        self.circuit = circuit

    @staticmethod
    def importRoadFromFile(filename : string) :
        """
        Recécupère un circuit ( un ensemble de points décrivant des courbe de Bézier ) depuis un .txt 
        format : X1,Y1,H1,W1;X2,Y2,H2,W2;X3,Y3,H3,W3
        """
        road = []
        file = open(filename,'r')
        try :
            for l in file.readlines():
                l = l.replace("\n",'')
                point = l.split(';')

                points = []

                for i in range(3):
                    tmp = [int(float(j)) for j in point[i].split(",")]
                    points.append(Point(tmp[0],tmp[1],tmp[2],tmp[3]))
                road.append(tuple(points))
                
        finally:
            file.close()
        return road

    @staticmethod
    def importRoadFromPic(filename : string):
        pass


    
    def saveRoad(self,gap) -> None :
        with open('data.csv', 'w') as file:
            for (P1,Pc,P2) in self.road :
                courbeB = Courbe(
                                Point(P1.getX() + gap , P1.getY()) , 
                                Point(Pc.getX() , Pc.getY() - gap) , 
                                Point(P2.getX() - gap, P2.getY())
                                )
                courbeM = Courbe(P1,Pc,P2)
                courbeT = Courbe(
                                Point(P1.getX() - gap , P1.getY()) , 
                                Point(Pc.getX() , Pc.getY() + gap) , 
                                Point(P2.getX() + gap, P2.getY())
                                )
                for i in range(len(courbeM.P)):
                    content = str(courbeB.P[i].getX())+","+str(courbeB.P[i].getY())+","+str(courbeM.P[i].getX())+","+str(courbeM.P[i].getY())+"," +str(courbeT.P[i].getX())+","+str(courbeT.P[i].getY())+"\n"
                    file.write(content)
        

    def getHeight(self) -> int :
        return Environment.height

    def getWidth(self) -> int :
        return Environment.width

    def getRoad(self) : 
        return self.road

class ModelThread(threading.Thread) :

    speed_model = 0.1 # Vitesse d'évolution de l'environnement
    condition = True

    def __init__(self, envt : Environment):
        threading.Thread.__init__(self)
        self.envt = envt
        self.robot = self.envt.robotAgent
        self.end = False

    def run2(self) :
        while(self.condition) :
            pygame.event.get()
            self.envt.update()
            if self.robot.algorithme.isCloseToLastPoint():
                if self.robot.algorithme.decision(): # si le robot n'a jamais quitte la route
                    self.robot.setVitesseMin(self.robot.getVitesseMin()+1)
                    self.robot.setVitesseMax(self.robot.getVitesseMax()+1)
                    self.robot.accelerer_lineaire()
                else:
                    self.robot.setVitesseMin(self.robot.getVitesseMin()-1)
                    self.robot.setVitesseMax(self.robot.getVitesseMax()-1)
                    self.robot.setVitesseOptimale(self.robot.getVitesseMin())
                    self.end = True
                    self.robot.decelerer_lineaire()

                if self.end:
                    print("Vitesse optimale :", self.robot.getVitesseOptimale())
                # on replace le robot au debut du virage
                self.robot.setRadian(2 *math.pi-self.angle(1, 0, (self.envt.circuit.controlPointsAngle[1][0] - self.robot.getFirstPosition().getX()), ( self.envt.circuit.controlPointsAngle[1][1] - self.robot.getFirstPosition().getY())))
                self.robot.setVecteurDirecteur(self.robot.getRadian().radToVectorDirector())
                self.robot.setPosition(self.robot.getFirstPosition().getX(), self.robot.getFirstPosition().getY())
                self.robot.setVitesseLineaireCourante(self.robot.getRadian().radToVectorDirector())
                self.robot.algorithme.setInside(True)
            time.sleep(ModelThread.speed_model)
        
    # run avec approche dichotomique
    def run(self) :
        tmpMin = self.robot.getVitesseMin()
        while(self.condition) :
            pygame.event.get()
            self.envt.update()
            if self.robot.algorithme.isCloseToLastPoint():
                if self.robot.algorithme.decision(): # si le robot n'a jamais quitte la route
                    tmpMin = self.robot.getVitesseMin()
                    self.robot.setVitesseMin(round((self.robot.getVitesseMin()+self.robot.getVitesseMax())/2, 0))
                    self.robot.accelerer_lineaire()
                else:
                    self.robot.setVitesseMax(self.robot.getVitesseMin())
                    self.robot.setVitesseMin(tmpMin)
                    # self.robot.setVitesseMax(round((self.robot.getVitesseMin()+self.robot.getVitesseMax())/2, 1))
                    self.robot.setVitesseOptimale(tmpMin)
                    self.robot.decelerer_lineaire()

                if self.robot.getVitesseMin() >= self.robot.getVitesseMax():
                    self.end = True

                if self.end:
                    print("Vitesse optimale :", self.robot.getVitesseOptimale())
                # on replace le robot au debut du virage
                self.robot.setRadian(2 *math.pi-self.angle(1, 0, ( self.envt.circuit.controlPointsAngle[1][0] - self.robot.getFirstPosition().getX()), (self.envt.circuit.controlPointsAngle[1][1] - self.robot.getFirstPosition().getY())))
                self.robot.setVecteurDirecteur(self.robot.getRadian().radToVectorDirector())
                self.robot.setPosition(self.robot.getFirstPosition().getX(), self.robot.getFirstPosition().getY())
                self.robot.setVitesseLineaireCourante(self.robot.getRadian().radToVectorDirector())
                self.robot.algorithme.setInside(True)
            time.sleep(ModelThread.speed_model)

    def setCondition(self,condition : bool):
        self.condition = condition

    def getEnd(self):
        return self.end

    """
    obtenir l'angle entre 2 vecteurs
    """
    def angle(self, x2, y2, x1, y1):
        dot = x1*x2 + y1*y2
        det = x1*y2 - y1*x2
        angle = np.arctan2(det, dot)
        return angle