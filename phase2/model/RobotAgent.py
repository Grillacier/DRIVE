from copyreg import constructor
from model.algorithmes.AlgoNaif import AlgoNaif
from model.percepts.Camera import Camera

class RobotAgent :

    height = 50
    width = 50

    acceleration_constante = ... # A definir m/s^2
    vitesse_max = ... # A definir
    vitesse_courante = 0
    direction_courante = ... # A definir

    VITESSE_MAX_VIRAGE = {} # Dictionnaire qui comporte les vitesse max du robot dans un virage

    def __init__(self,x : float,y  : float) -> None:
        self.x = x
        self.y = y
        self.vitesse_lineaire_courante = 0
        self.vitesse_angulaire_courante = 0
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

    def update(self) -> None:
        """
        Le robot se demandera a chaque pas de temps de l'environnement ce qu'il doit faire.
        La méthode decision de l'algorithme adopté permettra au robot de savoir ce qu'il doit faire.
        """
        self.algorithme.decision()

    def accelerer_lineaire(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        pass
  
    def accelerer_angulaire(self) -> None :
        """
        Appliquer la formule de L’équation de la position avec une vitesse uniformément accélérée
        x(t) = x_0 + v_{x0}*t+(1/2)a_{x0}*t^2
        """
        pass
    
    def getCamera(self) -> Camera : 
        return self.camera

    def getWidth(self) -> int :
        return RobotAgent.width

    def getHeight(self) -> int :
        return RobotAgent.height