"""
Classe abstraite à faire hériter pour les algorithmes à implémenter
"""
class Algorithme :

    def __init__(self,robotAgent) -> None:
        self.robotAgent = robotAgent

    def decision(self) -> None :
        """
        Méthode abstraite à enrichir...
        """
        pass

    def getDestination(self) : 
        return None