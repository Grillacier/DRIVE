"""
--------------------------------------------------------------------------
VERSION WINDOWS : Thread pour l'affichage et les controles sont désactivés
l'affichage et les controles de Pygame doivent etre pris en charge dans le 
thread principal sous windows.
--------------------------------------------------------------------------

Plateforme de test | PHASE 2 | pour implémenter et tester les algorithmes d'amélioration de conduite pour le robot turtlebot3
Liste des membres du projet :
    Jeremy DUFOURMANTELLE
    Ethan ABITBOL
    Jules CASSAN
    Elias BENDJABALLAH
"""

"""
Point d'entrée du programme
"""
from model.Environment import Environment
from view.Renderer import Renderer
from controls.Controls import Controls
import pygame
import time
import sys

pygame.init()

"""
Initialisation des composants de l'app
"""
envt = Environment()
renderer = Renderer(envt)
controls = Controls(envt,renderer)



envt.start() # Lancement du thread de l'environnement




# Contenu des threads affichage et controls condensé dans une boucle while dans le thread principal
while(renderer.getThread().getCondition()) :
    # verification de l'activation des controles : 
    for event in pygame.event.get() :
        # Action à activer lorsque le joueur presse une touche
        if event.type == pygame.QUIT:
                # On arrete les threads du model et de la view
                controls.getModel().stop()
                controls.getRenderer().stop()
                # On arrete la librairie graphique et on arete le programme
                pygame.quit()
                sys.exit()
        if event.type == pygame.VIDEORESIZE:
            controls.getRenderer().setHeight(event.h)
            controls.getRenderer().setWidth(event.w)

        if event.type == pygame.KEYDOWN:
            # A completer si on souhaite appuyer sur des touches ...
            pass
        if event.type == pygame.KEYUP:
            # A completer si on souhaite appuyer sur des touches ...
            pass

    # Gere l'affichage
    pygame.event.get()
    renderer.update()
    time.sleep(renderer.getThread().getSpeedView())