import sys
sys.path.append('..')
from utils.Point import Point
import math

class Droite:
    all = []
    def __init__(self, Point1: Point, Point2: Point) -> None:
        self.Point1 = Point1
        self.Point2 = Point2
        Droite.all.append(self)

    def __repr__(self) -> str:
        return f"Droite({self.Point1}; {self.Point2})"

    def calcul_longueur(self):
        return round(math.sqrt((self.Point1.x - self.Point2.x)**2 + (self.Point1.y - self.Point2.y)**2 ),1)