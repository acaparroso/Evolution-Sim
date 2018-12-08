#Let us begin



import pygame
import time
import random
import math
import numpy
from pygame import gfxdraw


def main():
	pygame.init()
	game_width = 1920
	game_height = 1080
	white = [255,255,255]
	gray = [127,127,127]
	black = [0,0,0]
	red = [255,0,0]
	green = [0,255,0]
	blue = [0,0,255]
	fps = 60
	numBots = 100
	numGenerations = 10
	numChangePerLife = 100
	mutation_rate = 0.2
	reproduction_rate = 0.0005
	initial_perception_radius = 100
	boundary_size = 10
	max_vel = 10
	colour_change_rate = 0.03
	colour_mutation_rate = 0.1
	initial_max_force = 0.02
	bots = []
	best_ever = 0
	best_ever_dna = []
	gameDisplay = pygame.display.set_mode((game_width, game_height))
	clock = pygame.time.Clock()

	#Change the colour of the bot over acquired change.
	def acquiredChange(colour_code):
		# minus means moving towards black plus means moving towards white.
		percent_change = 1+(random.random() * colour_change_rate)
		#Move towards clearer colour
		if(percent_change > 1):
			acquiredChanged_colour = (min(max((percent_change)*colour_code[0],0),255), min(max(percent_change*colour_code[1],0),255), min(max(percent_change*colour_code[2],0),255))
			acquiredChanged_colour_code = [min(max((percent_change)*colour_code[0],0),255)], [min(max(percent_change*colour_code[1],0),255)], [min(max(percent_change*colour_code[2],0),255)];
		elif(percent_change<1):
			acquiredChanged_colour = (max(min((percent_change)*colour_code[0],255),0), max(min(percent_change*colour_code[1],255),0), max(min(percent_change*colour_code[2],255),0))
			acquiredChanged_colour_code = [max(min((percent_change)*colour_code[0],255),0)], [max(min(percent_change*colour_code[1],255),0)], [max(min(percent_change*colour_code[2],255),0)];
		else:
			acquiredChanged_colour = (colour_code[0],colour_code[1],colour_code[2])
			acquiredChanged_colour_code = colour_code
		return(acquiredChanged_colour,acquiredChanged_colour_code)

	class create_bot(): #How to input dna????
		def __init__(self, x, y, dna=False):
			self.position = numpy.array([x,y], dtype='float64')
			self.colour = (gray[0],gray[1],gray[2])
			self.colour_code = gray

			if dna != False:
				#array to keep track of genetics in this case, it keeps track of the colour at the start of the lifecycle of the bot.
				self.dna = []
				
				#if new offspring triggers a mutation
				if random.random() < mutation_rate:
					#We move the colour slightly (non randomly)
					self.colour_code[0] = dna[0]*colour_mutation_rate
					self.colour_code[1] = dna[1]*colour_mutation_rate
					self.colour_code[2] = dna[2]*colour_mutation_rate
					self.dna = self.colour_code
					self.colour = (self.colour_code[0], self.colour_code[1], self.colour_code[2])
				else:
					#no mutation
					self.dna = dna
					self.colour_code = dna
					self.colour = (self.colour_code[0], self.colour_code[0], self.colour_code[0])
			else:
				#if it is a new bot, then set the color dna to be grey.
				self.dna = gray
			print(self.dna)


		def update(self):
			self.colour, self.colour_code = acquiredChange(self.colour_code)
		def reproduce(self):
			bots.append(create_bot(self.position[0], self.position[1], self.dna))


		def draw_bot(self):
			pygame.gfxdraw.aacircle(gameDisplay, int(self.position[0]), int(self.position[1]), 5, self.colour)
			pygame.gfxdraw.filled_circle(gameDisplay, int(self.position[0]), int(self.position[1]), 5, self.colour)
			
	#instantiation of bots
	for i in range(numBots):
		bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
	running = True
	countGen = 0
	countChange = 0
	while(running):
		gameDisplay.fill(blue)
		#set limit of generations.
		if(countGen >= numGenerations):
			running = False
		for event in pygame.event.get():
			if event.type == pygame.QUIT:
				running = False

		#go through acquired changes with all the bots
		for bot in bots[::-1]:
			bot.update()
			bot.draw_bot()

		#set limit of acquired changes.
		if(countChange >= numChangePerLife):
			#once acquired changes run, it is time to die and reproduce
			countGen += 1
			countChange = 0
			print('Generation ' + countGen + ': \n')
			#sort the list of bots (reverse if black is objective, default if white is objective) To get the best of the generation.
			bots.sort(reverse = True)
			#print the best values for this generation
			best_ever = bots[0].colour_code
			best_ever_dna = bot.dna
			print(best_ever, best_ever_dna)
			#grab the top 25% of population and reproduce them 4 times. Kill the rest.
			generationBest = []
			for i in range(numBots *0.25):
				generationBest.append(bots[i])
			#new generation
			bots[:] = []
			for i in range(len(generationBest)):
				for j in range(4):
					generationBest[j].reproduce()

		#if random.random()<0.02:
			#bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
		#increase the iteration counter and reset the frame.
		countChange += 1
		pygame.display.update()
		clock.tick(fps)

	pygame.quit()
	quit()




main()