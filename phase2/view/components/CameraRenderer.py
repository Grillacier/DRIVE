import pygame
from pygame.locals import *

class CameraRenderer :

    COLOR = (255,255,0) # Jaune
    TRANSPARENCE = 50 # 0 : invisible / 100 : non transparent

    def __init__(self,renderer) -> None:
        self.renderer = renderer
        self.update()

    def update(self) -> None :
        """
        Mise à jour de l'affichage
        """
        x,y,height,width = self.getData() # recuperation des données du modele
        y_rend = self.renderer.getHeight() - y - height
        surface = pygame.Surface((width, height), pygame.SRCALPHA)
        surface.fill(CameraRenderer.COLOR)
        surface.set_alpha(CameraRenderer.TRANSPARENCE)
        self.renderer.getMainFrame().blit(surface, (x, y_rend))


    def getData(self) :
        """
        Méthode qui recupere les données du modele et qui les transforme avec les dimensions courante 
        de la fenetre
        """
        x = self.renderer.getWidth() * self.renderer.getModel().getRobotAgent().getCamera().get_relative_X(self.renderer.getModel().getWidth())
        y = self.renderer.getHeight() * self.renderer.getModel().getRobotAgent().getCamera().get_relative_Y(self.renderer.getModel().getHeight())
        height = self.renderer.getHeight() * self.renderer.getModel().getRobotAgent().getCamera().get_relative_height(self.renderer.getModel().getHeight())
        width = self.renderer.getWidth() * self.renderer.getModel().getRobotAgent().getCamera().get_relative_width(self.renderer.getModel().getWidth())
        return x , y , height , width