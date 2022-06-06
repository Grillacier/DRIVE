#!/usr/bin/env python3
import rospy
from xml.dom import minidom
from geometry_msgs.msg import PoseStamped
from geometry_msgs.msg import Twist, Vector3
from move_base_msgs.msg import MoveBaseActionGoal, MoveBaseAction, MoveBaseGoal, MoveBaseActionResult


class Turtlebot:
    def __init__(self):
        
        self.waypoints = []

        self.file = "/home/ehoa/Desktop/P_AND/P-ANDROIDE/Road_gen_Gazebo/world2/world.sdf"
        
        rospy.init_node('waypointsnav')
        
        self.move_base_pub = rospy.Publisher("/move_base_simple/goal", PoseStamped, queue_size=1)


    def add_waypoint(self, list) -> None:
        self.waypoints.append(list)

    
    def goal_move_base(self, pose_x, pose_y, pose_z, pose_w) -> None:
        msg_move_to_goal = PoseStamped()
        msg_move_to_goal.pose.position.x = pose_x
        msg_move_to_goal.pose.position.y = pose_y
        msg_move_to_goal.pose.orientation.z = pose_z
        msg_move_to_goal.pose.orientation.w = pose_w
        msg_move_to_goal.header.frame_id = 'map'
        rospy.sleep(1)
        self.move_base_pub.publish(msg_move_to_goal)

    def get_waypoints_from_keyframes() -> None:
        pass

    
    def nav_into_points(self) -> None:
        for i in range(len(self.waypoints)):
            self.goal_move_base(self.waypoints[i][0], self.waypoints[i][1], self.waypoints[i][2], self.waypoints[i][3])
            rospy.wait_for_message("/move_base/result", MoveBaseActionResult, timeout=None)


if __name__ == '__main__':

    robot = Turtlebot()

    # Lecture des (x,y,z,o) calculés lors de la génération de l'environnement et 
    dom = minidom.parse(robot.file)
    elems = dom.getElementsByTagName('keyframe')
    i = 0
    for e in elems:
        if float(e.attributes['x'].value[:3]) > 1.5 and i%76 == 0:
            robot.add_waypoint([float(e.attributes['x'].value[:3]), float(e.attributes['y'].value[:3]), -0.6, 0.6])
        i += 1


    robot.nav_into_points()
