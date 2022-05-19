
from model.algorithmes.Algorithme import Algorithme

import numpy as np

"""
Algorithme de démonstration qui fait avancer le robot tout droit
"""
class AlgoNaif(Algorithme):

    def __init__(self,robotAgent) -> None:
        Algorithme.__init__(self,robotAgent)
        robotAgent.vitesse_lineaire_courante = np.array([0,0]) # On initialise la vitesse a 0

    def decision(self) -> None :
        """
        Donne un ordre au robot en fonction de la position du robot et de la destination
        """
        pass