import pygame
from pygame.locals import *
from model.utils.Courbe import *
from model.utils.Route import *
from model.utils.Circuit import *
from view.components.RobotRenderer import RobotRenderer
from view.components.road.RoadRenderer import RoadRenderer

class BoardRenderer:
    def __init__(self,renderer,roadrenderer:RoadRenderer,robotrenderer:RobotRenderer,x=10.0,y=10.0,height=100.0,width=100.0) -> None:
        self.x = x
        self.y = y
        self.height = height
        self.width = width
        self.roadrenderer = roadrenderer
        self.robotrenderder = robotrenderer
        self.renderer = renderer
        self.robot = self.renderer.getModel().getRobotAgent()
    
        self.update()

    def update(self) -> None :
        self.printData(f"Taille circuit : {self.roadrenderer.circuit.longueur} px",1)     
        XRobot,YRobot,_,_ = self.robotrenderder.getData()

        self.printData(f"Position robot : {round(self.robot.getX(),3),round(self.robot.getY(),3)}",2) 
        self.printData(f"Position curseur : {pygame.mouse.get_pos()}",3)
        x,y = self.robot.getVitesseLineaireCourante()
        v = math.sqrt(math.pow(x,2) + math.pow(y,2))
        self.printData(f"Vitesse : {v}", 4)
        self.printData(f"Vitesse min : {self.robot.getVitesseMin()}", 5)
        self.printData(f"Vitesse max : {self.robot.getVitesseMax()}", 6)
            

    def printData(self,data:str,ind:int) -> None :
        if pygame.font:
            font = pygame.font.Font(None, 16)
            text = font.render(data, True, (255, 255, 255))
            textpos = text.get_rect(x=self.x,y=20*ind)
            self.renderer.getMainFrame().blit(text, textpos)