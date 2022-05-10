from copyreg import constructor
from model.algorithmes.AlgoNaif import AlgoNaif
from model.percepts.Camera import Camera
from model.utils.Radian import Radian

import numpy as np
import time


class RobotAgent :

    height = 20
    width = 20

    acceleration_lineaire_constante = 2 # A definir m/s^2
    acceleration_angulaire_constante = 0
    vitesse_max = ... # A definir
    vitesse_courante = 0
    direction_courante = ... # A definir

    VITESSE_MAX_VIRAGE = {} # Dictionnaire qui comporte les vitesse max du robot dans un virage

    def __init__(self,x : float,y  : float) -> None:
        self.x = x
        self.y = y
        self.acceleration_active = False
        self.accel_time = 0
        self.local_clock = time.time()
        self.vecteur_directeur = np.array([0,1]) # Vecteur normalise
        self.current_radian = Radian(np.pi/2)
        self.vitesse_courante = 0 # px/s
        self.vitesse_lineaire_courante = 0
        self.vitesse_angulaire_courante = 0.1
        self.camera = Camera(self)
        self.algorithme = AlgoNaif(self) # Exemple
        """
         ## AJOUTER ICI LES ALGOS A IMPLEMENTER ##
         /!\ les algos doivent heriter de la classe abstraite Algorithme /!\.
        """
    def getX(self) -> float :
        return self.x

    def getY(self) -> float :
        return self.y

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

    def getVitesseLineaireCourante(self) -> float :
        return self.vitesse_lineaire_courante

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

    def getLastPosition(self) : 
        return self.last_position

    def setLastPosition(self,last_position) : 
        self.last_position = last_position

    def update(self) -> None:
        """
        Le robot se demandera a chaque pas de temps de l'environnement ce qu'il doit faire.
        La méthode decision de l'algorithme adopté permettra au robot de savoir ce qu'il doit faire.
        """
        # if self.acceleration_active :
        #     self.accel_time += time.time() - self.local_clock
        # else :
        #     self.accel_time = 0

        self.local_clock = time.time()
        self.algorithme.decision()

    def accelerer_lineaire(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        self.acceleration_active = True

        position_courante = np.array( [ self.x , self.y ] )
        
        # print(position_courante)

        self.accel_time = 1

        new_position = (position_courante + self.vecteur_directeur * ( (self.vitesse_courante * self.accel_time)  + ( (1/2) * RobotAgent.acceleration_lineaire_constante * self.accel_time**2 ) ) )

        # print(self.vecteur_directeur)
        # print("1 : ",(self.vitesse_courante * self.accel_time))
        # print("2 : ",( (1/2) * RobotAgent.acceleration_constante * self.accel_time**2 ))
        # print((self.vecteur_directeur * ( (self.vitesse_courante * self.accel_time) ) + ( (1/2) * RobotAgent.acceleration_constante * self.accel_time**2 )))

        self.vitesse_courante = np.abs(position_courante - new_position) # / (time.time() - self.local_clock)     

        self.x = new_position[0]

        self.y = new_position[1]

        # print(self.vitesse_courante)
  
    def accelerer_angulaire(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        new_radian_value,raw_new_radian_value = self.current_radian.updateRadian(RobotAgent.acceleration_angulaire_constante,self.vitesse_angulaire_courante)
        self.vitesse_angulaire_courante = np.abs(self.current_radian.getValue() - raw_new_radian_value)
        self.current_radian.setValue(new_radian_value)
        self.vecteur_directeur = self.current_radian.radToVectorDirector()
        print(self.current_radian.getValue())
    
    def getCamera(self) -> Camera : 
        return self.camera

    def getWidth(self) -> int :
        return RobotAgent.width

    def getHeight(self) -> int :
        return RobotAgent.height

    def getVecteurDirecteur(self) : 
        return self.vecteur_directeur