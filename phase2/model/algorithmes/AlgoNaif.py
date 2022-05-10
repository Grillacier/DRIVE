from model.algorithmes.Algorithme import Algorithme

"""
Algorithme de démonstration qui fait avancer le robot tout droit
"""
class AlgoNaif(Algorithme):

    def __init__(self,robotAgent) -> None:
        Algorithme.__init__(self,robotAgent)

    def decision(self) -> None :
        self.robotAgent.accelerer_lineaire()
        self.robotAgent.accelerer_angulaire()