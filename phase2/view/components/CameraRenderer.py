import pygame
from pygame.locals import *

class CameraRenderer :

    COLOR = (255, 150, 0) # Orange
    TRANSPARENCE = 50 # 0 : invisible / 100 : non transparent

    def __init__(self,renderer) -> None:
        self.renderer = renderer
        self.update()

    def update(self) -> None :
        """
        Mise à jour de l'affichage
        """
        x,y,height,width = self.getCamera() # recuperation des données du modele
        y_rend = self.renderer.getHeight() - y - height

        # surface = pygame.Surface((width, height), pygame.SRCALPHA)
        # surface.fill(CameraRenderer.COLOR)
        # surface.set_alpha(CameraRenderer.TRANSPARENCE)
        # self.renderer.getMainFrame().blit(surface, (x, y_rend))

        vecteur_directeur = self.renderer.getModel().getRobotAgent().getVecteurDirecteur()
        # print(vecteur_directeur)
        normal = self.renderer.getModel().getRobotAgent().getNormalVecteurDirecteur()

        x_1 = height * vecteur_directeur[0] + x
        y_1 = height * vecteur_directeur[1] + y
        x_2 = width * normal["x"] + x
        y_2 = width * normal["y"] + y
        
        # pygame.draw.polygon(self.renderer.getMainFrame(), CameraRenderer.COLOR,[(x_1,self.renderer.getHeight() - y_1),(x,self.renderer.getHeight() - y),(x_2 ,self.renderer.getHeight() - y_2),(x_1+x_2 -x,self.renderer.getHeight()- (y_2 + y_1 -y))]) # x , y , width , height


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
    
    def getCamera(self) :
        x = self.renderer.getModel().getRobotAgent().getCamera().getX()
        y = self.renderer.getModel().getRobotAgent().getCamera().getY()
        height =  self.renderer.getModel().getRobotAgent().getCamera().getHeight()
        width = self.renderer.getModel().getRobotAgent().getCamera().getWidth()
        return x , y , height , width