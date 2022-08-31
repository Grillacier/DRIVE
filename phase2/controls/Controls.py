import sys
import pygame
from pygame.locals import *
import threading
import time

class Controls :

    def __init__(self,model,renderer) -> None:
        self.model = model
        self.renderer = renderer
        self.thread = ThreadControls(self)

    def start(self) -> None :
        """
        Démarre le thread de mise à jour de la fenetre de jeu
        """
        self.thread.start()

    def stop(self) -> None :
        """
        Stop le thread de mise à jour de la fenetre de jeu
        """
        print("Arret de la detection de controle")
        self.thread.setCondition(False)

    def getModel(self) :
        return self.model

    def getRenderer(self) :
        return self.renderer

class ThreadControls(threading.Thread):
    """
    Classe qui s'occupe de mettre à jour l'affichage du jeu
    """
    speed_controls = 0.01 # Verification des controles
    condition = True

    RESIZABLE = True

    def __init__(self,controls) -> None:
        threading.Thread.__init__(self)
        self.controls = controls

    def run(self) -> None :
        while(ThreadControls.condition) :
            # verification de l'activation des controles : 
            for event in pygame.event.get() :
                # Action à activer lorsque le joueur presse une touche
                if event.type == pygame.QUIT or self.controls.getModel().thread.getEnd():
                        # On arrete les threads du model et de la view
                        self.controls.getModel().stop()
                        self.controls.getRenderer().stop()
                        self.controls.stop()
                        self.condition = False
                        # On arrete la librairie graphique et on arete le programme
                        pygame.quit()
                        sys.exit()
                if event.type == pygame.VIDEORESIZE:
                    if ThreadControls.RESIZABLE : 
                        self.controls.getRenderer().setHeight(event.h)
                        self.controls.getRenderer().setWidth(event.w)

                if event.type == pygame.KEYDOWN:
                    # A completer si on souhaite appuyer sur des touches ...
                    print(self.controls.getModel().getWidth())
                if event.type == pygame.KEYUP:
                    # A completer si on souhaite appuyer sur des touches ...
                    print(self.controls.getModel().getWidth())
            time.sleep(ThreadControls.speed_controls)


    def setCondition(self,condition) -> None:
        """
        Met à jour la condition d'actualisation de l'affichage
        """
        self.condition = condition