import numpy as np

class Radian : 

    def __init__(self,value) -> None:
        self.value = value

    def updateRadianDroite(self,step,vitesse_angulaire):
        return (vitesse_angulaire + self.value + step ) % (2 * np.pi),(vitesse_angulaire +  self.value + step)

    def updateRadianGauche(self,step,vitesse_angulaire):
        return (self.value - vitesse_angulaire - step ) % (2 * np.pi),(vitesse_angulaire +  self.value + step)

    def radToVectorDirector(self):
        return np.array([np.cos(self.value),np.sin(self.value)])

    def setValue(self,value) : 
        self.value = value

    def getValue(self) :
        return self.value