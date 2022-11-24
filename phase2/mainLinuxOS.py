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
import math
import os
import sys
from model.Environment import Environment
from view.Renderer import Renderer
from controls.Controls import Controls
import pygame

pygame.init()

"""
Initialisation des composants de l'app
"""

# entrer le nom du circuit en ligne de commande
filename = sys.argv[1]

envt = Environment(filename)
renderer = Renderer(envt)

# on place le robot sur le 1er point de la route et on oriente son vecteur directeur sur le 2e
envt.robotAgent.setPosition(renderer.roadRenderer.circuit.controlPointsAngle[0][0], renderer.roadRenderer.circuit.controlPointsAngle[0][1])
envt.robotAgent.setFirstPosition(envt.robotAgent.getPosition())
angle = 2 *math.pi-envt.thread.angle(1, 0, (envt.circuit.controlPointsAngle[1][0] - envt.robotAgent.getFirstPosition().getX()), (envt.circuit.controlPointsAngle[1][1] -envt.robotAgent.getFirstPosition().getY()))
envt.robotAgent.setRadian(angle)
envt.robotAgent.setVecteurDirecteur(envt.robotAgent.getRadian().radToVectorDirector())


envt.start() # Lancement du thread de l'environnement

# ne marche pas
#envt.saveRoad(20)


renderer.start() # Lancement du thread de l'affichage
controls = Controls(envt,renderer)
controls.start() # Lancement du thread des controles