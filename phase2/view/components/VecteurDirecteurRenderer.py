from model.percepts.Camera import Camera

import pygame
from pygame.locals import *

"""
Affichage du vecteur directionnel du robot
"""
class VecteurDirecteurRenderer :

    rayon = 100

    COLOR = (0,255,0) # vert

    def __init__(self,renderer) -> None:
        self.renderer = renderer
        self.update()

    def update(self) -> None :
        (x_1, y_1),(x_2, y_2) = self.getData2() # recuperation des donnees du modele
        # y_1 = self.renderer.getHeight() - y_1
        # y_2 = self.renderer.getHeight() - y_2
        pygame.draw.line(self.renderer.getMainFrame(), VecteurDirecteurRenderer.COLOR, (x_1 , y_1),(x_2,y_2))


    """
    pygame.draw.line(screen, Color_line, (60, 80), (130, 100))
    pygame.display.flip()
    """

    def getData(self) :
        """
        Méthode qui recupere les données du modele et qui les transforme avec les dimensions courante 
        de la fenetre
        """
        vecteur_directeur = self.renderer.getModel().getRobotAgent().getVecteurDirecteur()

        x_1 = self.renderer.getWidth() * (( ( self.renderer.getModel().getRobotAgent().getX() + (self.renderer.getModel().getRobotAgent().getWidth() / 2) )) / self.renderer.getModel().getWidth() )
        y_1 = self.renderer.getHeight() * (( ( self.renderer.getModel().getRobotAgent().getY() + (self.renderer.getModel().getRobotAgent().getHeight() / 2) )) / self.renderer.getModel().getHeight() )

        x_2 = vecteur_directeur[0] * VecteurDirecteurRenderer.rayon + x_1
        y_2 = vecteur_directeur[1] * VecteurDirecteurRenderer.rayon + y_1

        return (x_1 , y_1),(x_2,y_2) 
    
    def getData2(self) :
        """
        Méthode qui recupere les données du modele et qui les transforme avec les dimensions courante
        de la fenetre
        """
        vecteur_directeur = self.renderer.getModel().getRobotAgent().getVecteurDirecteur()
        x_1 = self.renderer.getModel().getRobotAgent().getX() + (self.renderer.getModel().getRobotAgent().getWidth() / 2)
        y_1 = self.renderer.getModel().getRobotAgent().getY() + (self.renderer.getModel().getRobotAgent().getWidth() / 2)

        x_2 = vecteur_directeur[0] * VecteurDirecteurRenderer.rayon + x_1
        y_2 = vecteur_directeur[1] * VecteurDirecteurRenderer.rayon + y_1

        return (x_1 , y_1),(x_2,y_2)
    
    def getVecteurDirecteur(self) :
        return self.renderer.getModel().getRobotAgent().getVecteurDirecteur()
    
    def getRobotAgent(self) :
        return self.renderer.getModel().getRobotAgent()