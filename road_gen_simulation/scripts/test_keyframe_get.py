# from logging import root
# import xml.etree.ElementTree as xmlET

file = "/home/ehoa/Desktop/P_AND/P-ANDROIDE/Road_gen_Gazebo/world2/world.sdf"

# tree_root = xmlET.parse(file).getroot()

# for elem in tree_root.findall('plugin/keyframe'):
#     x, y = elem.get('x'), elem.get('y')
#     print(x, y)


# for child in root:
#     print(child.tag, child.attrib)

from xml.dom import minidom

dom = minidom.parse(file)
elems = dom.getElementsByTagName('keyframe')

for e in elems:
    print(e.attributes['x'].value[:4])
    print(e.attributes['y'].value)