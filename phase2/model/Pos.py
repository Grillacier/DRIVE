import Environment

import os
import rospy
from nav_msgs.msg import Odometry
import json

class Pos():
    def __init__(self):
        self.data__ = ""
        self.agent = Environment.Environment().robotAgent
        rospy.init_node('get_pos_and_twist')
        odom_sub = rospy.Subscriber('/odom', Odometry, self.callback)

        #rospy.spin()

    def callback(self, msg):
        #print(msg)
        self.data__ = {
      'pose' : {
        'position' : {
          'x' : self.agent.getX(),
          'y' : self.agent.getY(),
          'z' : 0
        },
        'orientation' : {
          'x' : self.agent.getVecteurDirecteur()[0],
          'y' : self.agent.getVecteurDirecteur()[1],
          'z' : 0,
          'w' : 0
        }
      },
      'twist' : {    
        'linear' : {
          'x' : self.agent.getVitesseLineaireCourante()[0],
          'y' : self.agent.getVitesseLineaireCourante()[1],
          'z' : 0
        },
        'angular' : {
          'x' : self.agent.getVitesseAngulaireCourante(),
          'y' : self.agent.getVitesseAngulaireCourante(),
          'z' : 0
        }
      }
    }
        
        with open('data.json', 'w') as fp:
            json.dump(self.data__, fp)

    def getData(self):
	    return self.data__

p = Pos()