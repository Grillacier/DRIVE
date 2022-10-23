from copyreg import constructor
from model.algorithmes.AlgoNaif import AlgoNaif
from model.algorithmes.DBR import DBR
from model.algorithmes.DBRA import DBRA
from model.algorithmes.DBRAVirage import DBRAVirage
from model.percepts.Camera import Camera
from model.utils.Radian import Radian
from model.utils.Point import Point

import numpy as np
import time
import math




class RobotAgent :

    height = 20
    width = 20

    acceleration_lineaire_constante = 1.1 # A definir m/s^2
    deceleration_lineaire_constante = 3 # A definir m/s^2
    acceleration_angulaire_constante = 0

    COLOR_ON_ROAD = (96, 255, 0)
    COLOR_OUT_ROAD = (255, 0, 18)

    def __init__(self,env) -> None:
        self.x = 0
        self.y = 0
        self.env = env
        self.vecteur_directeur = np.array([1,1]) # Vecteur normalise
        self.current_radian = Radian(np.pi/2)
        self.vitesse_lineaire_courante = np.array([0,5])
        self.vitesse_angulaire_courante = 0.1
        self.vitesse_min = 5.0
        self.vitesse_max = 20.0
        self.vitesse_optimale = self.vitesse_min
        self.camera = Camera(self)
        # self.algorithme = DBRA(self) # Algorithme utilisé par le robot
        self.algorithme = DBRAVirage(self)

        self.vitesse_reelle = self.vitesse_min

        self.first_position = Point(self.x, self.y)
        



        """
         ## AJOUTER ICI LES ALGOS A IMPLEMENTER ##
         /!\ les algos doivent heriter de la classe abstraite Algorithme /!\.
        """

    def getX(self) -> float :
        return self.x

    def getY(self) -> float :
        return self.y

    def getPosition(self):
        return Point(self.x, self.y)

    def setPosition(self, x, y) :
        self.x = x
        self.y = y

    def get_relative_Y(self,max_height) -> float:
        """
        Retourne la valeur y relative
        """
        return self.y / max_height

    def get_relative_X(self,max_width) -> float:
        """
        Retourne la valeur x relative
        """
        return self.x / max_width

    def get_relative_height(self,max_height) -> float:
        """
        Retourne la hauteur relative
        """
        return RobotAgent.height / max_height

    def get_relative_width(self,max_width) -> float:
        """
        Retourne la largeur relative
        """
        return RobotAgent.width / max_width

    def getRadian(self):
        return self.current_radian

    def getRadianValue(self):
        return self.current_radian.getValue()

    def setRadian(self, value):
        self.current_radian.setValue(value)

    def getVitesseReelle(self):
        return self.vitesse_reelle

    def getVitesseLineaireCourante(self) -> float :
        return self.vitesse_lineaire_courante

    def setVitesseLineaireCourante(self, vitesse_lineaire) -> None :
        self.vitesse_lineaire_courante = vitesse_lineaire

    def getVitesseAngulaireCourante(self) -> float :
        return self.vitesse_angulaire_courante

    def getVecteurDirecteur(self) :
        return self.vecteur_directeur

    def setVecteurDirecteur(self,vecteur_directeur) : 
        self.vecteur_directeur = vecteur_directeur

    def getVitesseCourante(self) -> float : 
        return self.vitesse_courante
    
    def setVitesseCourante(self,vitesse_courante) -> None :
        self.vitesse_courante = vitesse_courante

    def getVitesseMin(self) -> float :
        return self.vitesse_min

    def setVitesseMin(self, vitesse_min) -> None :
        self.vitesse_min = vitesse_min

    def getVitesseMax(self) -> float :
        return self.vitesse_max

    def setVitesseMax(self, vitesse_max) -> None :
        self.vitesse_max = vitesse_max

    def getVitesseOptimale(self) -> float :
        return self.vitesse_optimale

    def setVitesseOptimale(self, vitesse_optimale) -> None :
        self.vitesse_optimale = vitesse_optimale

    def getFirstPosition(self) : 
        return self.first_position

    def setFirstPosition(self,first_position) : 
        self.first_position = first_position

    def getLastPosition(self) : 
        return self.last_position

    def setLastPosition(self,last_position) : 
        self.last_position = last_position

    def update(self) -> None:
        """
        Le robot se demandera a chaque pas de temps de l'environnement ce qu'il doit faire.
        La méthode decision de l'algorithme adopté permettra au robot de savoir ce qu'il doit faire.
        """
        self.appliquer_vitesse()

        self.algorithme.decision()


    def accelerer_lineaire(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        """
        self.vitesse_reelle += (1/2) * RobotAgent.acceleration_lineaire_constante

        if self.vitesse_reelle > self.vitesse_max :
            self.vitesse_reelle = self.vitesse_max


        self.vitesse_lineaire_courante = self.vecteur_directeur * self.vitesse_reelle
  
    def decelerer_lineaire(self) -> None : 

        self.vitesse_reelle -= (1/2) * self.deceleration_lineaire_constante
        if self.vitesse_reelle < self.vitesse_min :
            self.vitesse_reelle = self.vitesse_min
        self.vitesse_lineaire_courante = self.vecteur_directeur * self.vitesse_reelle

    def accelerer_angulaire_gauche(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        new_radian_value,raw_new_radian_value = self.current_radian.updateRadianGauche(RobotAgent.acceleration_angulaire_constante,self.vitesse_angulaire_courante)
        self.vitesse_angulaire_courante = np.abs(self.current_radian.getValue() - raw_new_radian_value)
        self.current_radian.setValue(new_radian_value)
        
    def accelerer_angulaire_droite(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        new_radian_value,raw_new_radian_value = self.current_radian.updateRadianDroite(RobotAgent.acceleration_angulaire_constante,self.vitesse_angulaire_courante)
        self.vitesse_angulaire_courante = np.abs(self.current_radian.getValue() - raw_new_radian_value)
        self.current_radian.setValue(new_radian_value)
    
    def appliquer_vitesse(self) -> None : 

        self.x = self.x + self.vitesse_lineaire_courante[0]

        self.y = self.y + self.vitesse_lineaire_courante[1]

        self.vecteur_directeur = self.current_radian.radToVectorDirector()
   
    def getCamera(self) -> Camera : 
        return self.camera

    def getWidth(self) -> int :
        return RobotAgent.width

    def getHeight(self) -> int :
        return RobotAgent.height
    
    def getNormalVecteurDirecteur(self):
        d = {"x":self.vecteur_directeur[0],"y":self.vecteur_directeur[1]}
        q = math.sqrt(d["x"] * d["x"] + d["y"] * d["y"])
        return { "x": -d["y"] / q, "y": d["x"] / q }
    
    def getDestination(self) : 
        return self.algorithme.getDestination()
