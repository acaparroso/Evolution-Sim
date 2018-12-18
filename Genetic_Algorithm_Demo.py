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
	gray = [127,127,127]
	black = [0,0,0]
	red = [255,0,0]
	green = [0,255,0]
	blue = [0,0,255]
	fps = 100
	numBots = 100
	numGenerations = 10
	numChangePerLife = 100
	mutation_rate = 0.2
	reproduction_rate = 0.005
	initial_perception_radius = 100
	boundary_size = 10
	max_vel = 10
	colour_change_rate = 0.00003
	colour_mutation_rate = 0.005
	initial_max_force = 0.02
	bots = []
	best_ever = 0
	best_ever_dna = []
	gameDisplay = pygame.display.set_mode((game_width, game_height))
	clock = pygame.time.Clock()

	#Change the colour of the bot over acquired change.
	def acquiredChange(colour_code):
		print(colour_code)
		# minus means moving towards black plus means moving towards white.
		percent_change = (random.random() * colour_change_rate)
		#Move towards clearer colour
		if(percent_change > 1):
			acquiredChanged_colour = (min(max(((percent_change*255) + colour_code[0]) +colour_code[0],0),255), min(max(((percent_change*255) + colour_code[0]) +colour_code[1],0),255), min(max(((percent_change*255) + colour_code[0]) +colour_code[2],0),255))
			acquiredChanged_colour_code = [min(max(((percent_change*255) + colour_code[0]) +colour_code[0],0),255), min(max(((percent_change*255) + colour_code[0]) +colour_code[1],0),255), min(max(((percent_change*255) + colour_code[0]) +colour_code[2],0),255)]
		elif(percent_change<1):
			acquiredChanged_colour = (max(min(((percent_change*255) + colour_code[0]) +colour_code[0],255),0), max(min(((percent_change*255) + colour_code[0]) +colour_code[1],255),0), max(min(((percent_change*255) + colour_code[0]) +colour_code[2],255),0))
			acquiredChanged_colour_code = [max(min(((percent_change*255) + colour_code[0]) +colour_code[0],255),0), max(min(((percent_change*255) + colour_code[0]) +colour_code[1],255),0), max(min(((percent_change*255) + colour_code[0]) +colour_code[2],255),0)]
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
				self.dna = dna
				
				#if new offspring triggers a mutation
				if random.random() < mutation_rate:
					#We move the colour slightly (non randomly)
					mutation_amount = (colour_mutation_rate * 255)
					if((dna[0] - mutation_amount) < 0):
						self.colour_code[0] = 0
						self.colour_code[1] = 0
						self.colour_code[2] = 0
					else:
						self.colour_code[0] = dna[0] - (mutation_amount)
						self.colour_code[1] = dna[1] - (mutation_amount)
						self.colour_code[2] = dna[2] - (mutation_amount)
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


		def update(self):
			self.colour, self.colour_code = acquiredChange(self.colour_code)
			
		def reproduce(self):
			bots.append(create_bot(self.position[0]+10, self.position[1]+10, self.dna))


		def draw_bot(self, x, y):
			pygame.gfxdraw.aacircle(gameDisplay, int(x*20), int(y*20), 20, self.colour)
			pygame.gfxdraw.filled_circle(gameDisplay, int(x*20), int(y*20), 20, self.colour)
			
	#instantiation of bots
	for i in range(numBots):
		bots.append(create_bot(random.uniform(0,game_width),random.uniform(0,game_height)))
	running = True
	countGen = 1
	countChange = 0
	while(running):
		gameDisplay.fill(blue)
		pygame.gfxdraw.aacircle(gameDisplay, 200, 200, 20, (127,127,127))
		pygame.gfxdraw.filled_circle(gameDisplay, 200, 200, 20, (127,127,127))
		#set limit of generations.
		if(countGen >= numGenerations):
			running = False
		for event in pygame.event.get():
			if event.type == pygame.QUIT:
				running = False

		#go through acquired changes with all the bots
		count = 1
		for bot in bots:
			bot.update()
			bot.draw_bot(count,countGen)
			count += 1
		
		#set limit of acquired changes.
		if(countChange >= numChangePerLife):
			print("The number of bots is = ",len(bots), "The last for loop got called ", count, " times")
			#once acquired changes run, it is time to die and reproduce
			countGen += 1
			countChange = 0
			print('Generation ' , countGen , ': \n')
			#sort the list of bots (reverse if black is objective, default if white is objective) To get the best of the generation.
			bots.sort(key=lambda t: t.colour_code[0], reverse = True)
			#print the best values for this generation
			best_ever = bots[0].colour_code
			best_ever_dna = bots[0].dna
			print(best_ever, best_ever_dna)
			#grab the top 25% of population and reproduce them 4 times. Kill the rest.
			generationBest = []
			numReplic = int(numBots *0.25)
			print("This is how many bots after the call: ",numReplic)
			for i in range(numReplic):
				generationBest.append(bots[i])
			
			#new generation
			print("Length of bots before deletion: ", len(bots))
			del bots[:]
			print("Length of bots after deletion: ", len(bots))
			print("length of generationBest ", len(generationBest))
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