from model.Environment import Environment
from view.components.RobotRenderer import RobotRenderer
from view.components.BoardRenderer import BoardRenderer
from view.components.road.RoadRenderer import RoadRenderer

import pygame
from pygame.locals import *
import threading
import time

class Renderer :

    NAME_APP = "Simulateur de conduite autonome"
    BLACK = (0,0,0)

    """
    Classe qui s'occupe de l'affichage
    """
    WIDTH = 700
    HEIGHT = 700

    def __init__(self,model : Environment) -> None:
        self.width = Renderer.WIDTH
        self.height = Renderer.HEIGHT
        self.model = model
        pygame.display.init()
        pygame.display.set_caption(Renderer.NAME_APP)
        self.main_frame = pygame.display.set_mode((self.width,self.height),pygame.RESIZABLE,vsync=1) # Création de la fenêtre principale
        # Thread qui s'occupe de rafraichir la vue
        self.thread = RendererThread(self)
        self.roadRenderer = RoadRenderer(self)
        self.robotRenderer = RobotRenderer(self)
        self.boardRenderer = BoardRenderer(self,self.roadRenderer,self.robotRenderer)
        
    def update(self) -> None:
        """
        Mise à jour de la vue
        """
        self.main_frame.fill(Renderer.BLACK) # On redessine l'affichage a chaque mise a jour
        self.update_component()
        pygame.display.flip() # met à jour l'affichage de la fenetre

    def update_component(self) -> None :
        """
        Met à jour tout les composants de l'affichage
        """
        self.roadRenderer.update()
        self.robotRenderer.update()
        self.boardRenderer.update()

    def start(self) -> None :
        """
        Démarre le thread de mise à jour de la fenetre
        """
        self.thread.start()

    def stop(self) -> None :
        """
        Stop le thread de mise à jour de la fenetre
        """
        print("Arret de l'affichage")
        self.thread.setCondition(False)

    def getMainFrame(self) :
        return self.main_frame

    def getModel(self) -> Environment :
        return self.model

    def getHeight(self) -> int :
        return self.height

    def getWidth(self) -> int :
        return self.width

    def setHeight(self,height) -> None :
        self.height = height

    def setWidth(self,width) -> None :
        self.width = width

    def getThread(self) :
        return self.thread

class RendererThread(threading.Thread) :
    """
    Classe qui s'occupe de mettre à jour l'affichage
    """
    speed_view = 0.01 # Mise à jour de l'écran toutes les 0.01 secondes
    condition = True

    def __init__(self,renderer : Renderer) -> None:
        threading.Thread.__init__(self)
        self.renderer = renderer

    def run(self) -> None :
        while(self.condition) :
            pygame.event.get()
            self.renderer.update()
            time.sleep(RendererThread.speed_view)

    def setCondition(self,condition) -> None:
        """
        Met à jour la condition d'actualisation de l'affichage
        """
        self.condition = condition

    def getCondition(self) -> bool: 
        return self.condition
    
    def getSpeedView(self) -> float :
        return RendererThread.speed_view