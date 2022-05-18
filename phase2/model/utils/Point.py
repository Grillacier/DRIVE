import math

class Point :

    def __init__(self,x : float,y : float, height = 0 , width = 0) -> None:
        self.x = x
        self.y = y
        self.height = height
        self.width = width
    
    def __repr__(self) -> str:
        return "Point({},{})".format(self.x,self.y)

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
        return self.height / max_height

    def get_relative_width(self,max_width) -> float:
        """
        Retourne la largeur relative
        """
        return self.width / max_width
    
    
    def calcul_longueur(self,point2) -> float:
        """
        Calcule la longueur entre deux points
        """
        return round(math.sqrt((self.x - point2.x)**2 + (self.y - point2.y)**2 ),1)

    def setValue(self,x:float,y:float) -> None:
        """
        Set les valeurs de x et y
        """
        self.x = x
        self.y = y