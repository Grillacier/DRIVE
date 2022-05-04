"""
--------------------------------------------------------------------------
VERSION LINUX : Thread pour l'affichage et les controles sont activés
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

pygame.init()

"""
Initialisation des composants de l'app
"""
envt = Environment()
renderer = Renderer(envt)
envt.start() # Lancement du thread de l'environnement

envt.saveRoad(20)


renderer.start() # Lancement du thread de l'affichage
controls = Controls(envt,renderer)
controls.start() # Lancement du thread des controles