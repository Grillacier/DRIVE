from view.components.VecteurDirecteurRenderer import VecteurDirecteurRenderer
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
        self.camera_renderer = CameraRenderer(self.renderer)
        self.vecteur_directeur_renderer = VecteurDirecteurRenderer(self.renderer)
        self.vecteur_directeur = self.vecteur_directeur_renderer.getVecteurDirecteur()
        self.update()
        

    def update(self) -> None :
        """
        Mise à jour de l'affichage
        """

        """
        Update des autres composants
        """
        self.camera_renderer.update()
        self.vecteur_directeur_renderer.update()


        x,y,height,width = self.getRobotAgent() # recuperation des données du modele
        y_rend = self.renderer.getHeight() - y - height
        vecteur_directeur = self.vecteur_directeur_renderer.getVecteurDirecteur()
        # print(vecteur_directeur)
        normal = self.vecteur_directeur_renderer.getRobotAgent().getNormalVecteurDirecteur()

        x_1 = height * vecteur_directeur[0] + x
        y_1 = height * vecteur_directeur[1] + y
        x_2 = width * normal["x"] + x
        y_2 = width * normal["y"] + y
        
        #pygame.draw.polygon(self.renderer.getMainFrame(), RobotRenderer.COLOR,[( x+height, y_rend),(x, y_rend),(x, y_rend+width),( x+width, y_rend+height)]) # x , y , width , height
        pygame.draw.polygon(self.renderer.getMainFrame(), RobotRenderer.COLOR,[(x_1,self.renderer.getHeight() - y_1),(x,self.renderer.getHeight() - y),(x_2,self.renderer.getHeight() - y_2),(x_1+x_2 -x,self.renderer.getHeight()- (y_2 + y_1 -y))]) # x , y , width , height
        #pygame.draw.line(self.renderer.getMainFrame(), VecteurDirecteurRenderer.COLOR, (x,  self.renderer.getHeight() - y ),(x_1,self.renderer.getHeight() - y_1))
        
        

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
    
    def getRobotAgent(self) :
        x = self.renderer.getModel().getRobotAgent().getX()
        y = self.renderer.getModel().getRobotAgent().getY()
        height = self.renderer.getModel().getRobotAgent().height
        width = self.renderer.getModel().getRobotAgent().width
        return x , y , height , width