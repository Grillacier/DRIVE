from view.components.CameraRenderer import CameraRenderer
import pygame
from pygame.locals import *

"""
Le robot est représenté pour l'instant avec un carre rouge
"""
class RobotRenderer :

    COLOR = (255,0,0) # rouge

    def __init__(self, renderer) -> None:
        self.renderer = renderer
        self.update()
        

    def update(self) -> None :
        """
        Mise à jour de l'affichage
        """
        x,y,height,width = self.getData() # recuperation des données du modele
        y_rend = self.renderer.getHeight() - y - height
        pygame.draw.rect(self.renderer.getMainFrame(), RobotRenderer.COLOR, pygame.Rect(x, y_rend, width, height)) # x , y , width , height
        self.camera_renderer = CameraRenderer(self.renderer)
        self.camera_renderer.update()

    def getData(self) :
        """
        Méthode qui recupere les données du modele et qui les transforme avec les dimensions courante 
        de la fenetre
        """
        x = self.renderer.getWidth() * self.renderer.getModel().getRobotAgent().get_relative_X(self.renderer.getModel().getWidth())
        y = self.renderer.getHeight() * self.renderer.getModel().getRobotAgent().get_relative_Y(self.renderer.getModel().getHeight())
        height = self.renderer.getHeight() * self.renderer.getModel().getRobotAgent().get_relative_height(self.renderer.getModel().getHeight())
        width = self.renderer.getWidth() * self.renderer.getModel().getRobotAgent().get_relative_width(self.renderer.getModel().getWidth())
        return x , y , height , width