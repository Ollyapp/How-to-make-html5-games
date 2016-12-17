// entity.js

player = function() {
// Player
	var self = actor("player", "my_id", 250, 250, 5, 5, 50, 50, Img.player, 10, 1);

	self.up_key = false;
	self.down_key = false;
	self.left_key = false;
	self.right_key = false;
	self.aim_angle = 0;

	self.update_entity_position = function() {
		if(self.up_key) 
			self.y -= 10;
		if(self.down_key) 
			self.y += 10;
		if(self.left_key) 
			self.x -= 10;
		if(self.right_key) 
			self.x += 10;

		if(self.x < self.width / 2)
			self.x = self.width / 2;
		if(self.x > CANVAS_WIDTH - self.width / 2)
			self.x = CANVAS_WIDTH - self.width / 2;
		if(self.y < self.height / 2)
			self.y = self.height / 2;
		if(self.y > CANVAS_HEIGHT - self.height / 2)
			self.y = CANVAS_HEIGHT - self.height / 2;
	}

	return self;
}

entity = function(type, id, x, y, spd_x, spd_y, width, height, img) {
	var self = {
		type: type,
		id: id,
		x: x,
		y: y,
		spd_x: spd_x,
		spd_y: spd_y,
		width: width,
		height: height,
		img: img
	};
	self.update = function() {
		self.update_entity_position();
		self.draw_entity();
	}

	self.update_entity_position = function() {
		self.y += self.spd_y;
		self.x += self.spd_x;

		if(self.x <= 0 || self.x >= CANVAS_WIDTH) {
			self.spd_x = -self.spd_x;
		}

		if(self.y <= 0 || self.y >= CANVAS_HEIGHT) {
			self.spd_y = -self.spd_y;
		}

	}

	self.draw_entity = function() {
		ctx.save();
		var x = self.x - player.x;
		var y = self.y - player.y;

		x += CANVAS_WIDTH / 2;
		y += CANVAS_HEIGHT / 2;

		x -= self.width / 2;
		y -= self.height / 2;

		ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
		ctx.restore();
	}	

	self.get_distance_between_entities = function(entity2) {
		var vx = self.x - entity2.x;
		var vy = self.y -entity2.y;
		return Math.sqrt(vx * vx + vy * vy);
	}

	self.test_collision = function(entity2) {
		var rect1 = {
			x: self.x - self.width / 2,
			y: self.y - self.height / 2, // Dont understand why he made these half values by doing - half width,
			width: self.width,
			height: self.height
		}

		var rect2 = {
			x: entity2.x - entity2.width / 2,  // Dont understand why he made these half values by doing - half width,
			y: entity2.y - entity2.height / 2, 
			width: entity2.width,
			height: entity2.height
		}
		return test_collision_between_rectangles(rect1, rect2);
	}

	return self;
}

actor = function(type, id, x, y, spd_x, spd_y, width, height, img, hp, attack_spd) {
	var self = entity(type, id, x, y, spd_x, spd_y, width, height, img);

	self.hp = hp;
	self.attack_spd = attack_spd;
	self.attack_counter = 0;

	var super_update = self.update; //no idea what this is about
	self.update = function() {
		super_update();
		self.attack_counter += self.attack_spd;
	}

	self.fire_bullet = function() {
		if(self.attack_counter > 25) {
			generate_bullet(self);
			self.attack_counter = 0;
		}
	}

	self.fire_special = function() {
		if(self.attack_counter > 50) {
				generate_bullet(self, self.aim_angle -3);
				generate_bullet(self, self.aim_angle);
				generate_bullet(self, self.aim_angle +3);
			self.attack_counter = 0;
		}
		mouse.preventDefault();
	}
	return self;
}

enemy = function(x, y, spd_x, spd_y, id, width, height) {
	// Enemy3
	var self = actor("enemy", id, x, y, spd_x, spd_y, width, height, Img.enemy, 10, 1);

	self.aim_angle = 0;

	enemy_list[id] = self;
}

upgrade = function(x, y, spd_x, spd_y, id, width, height, category, img) {
	// Enemy3
	var self = entity("upgrade", id, x, y, spd_x, spd_y, width, height, img);

	self.category = category

	upgrade_list[id] = self;
}

bullet = function(x, y, spd_x, spd_y, id, width, height) {
	// Enemy3
	var self = entity("bullet", id, x, y, spd_x, spd_y, width, height, Img.bullet)

	self.timer = 0;

	bullet_list[id] = self;
}

generate_enemy = function() {
	// Math.random() generates a number between 0 and 1
	var x = Math.random() * CANVAS_WIDTH;
	var y = Math.random() * CANVAS_HEIGHT;
	var width = 64;
	var height = 64;
	var id = Math.random();
	var spd_x = 5 + Math.random() * 2;
	var spd_y = 5 + Math.random() * 2

	enemy(x, y, spd_x, spd_y, id, width, height);
}

generate_upgrade = function() {
	// Math.random() generates a number between 0 and 1
	var x = Math.random() * CANVAS_WIDTH;
	var y = Math.random() * CANVAS_HEIGHT;
	var width = 32;
	var height = 32;
	var id = Math.random();
	var spd_x = 0;
	var spd_y = 0;

	if(Math.random() < 0.3) {
		var category = "attack_spd";
		var img = Img.upgrade1;
	}

	else {
		var category = "score";
		var img = Img.upgrade2;
	}

	upgrade(x, y, spd_x, spd_y, id, width, height, category, img);
}

generate_bullet = function(actor, overwrite_angle) {
	// Math.random() generates a number between 0 and 1
	var x = actor.x;
	var y = actor.y;
	var width = 32;
	var height = 32;
	var id = Math.random();
	var angle = actor.aim_angle;

	if(overwrite_angle !== undefined) 
		angle = overwrite_angle;

	var spd_x = Math.cos(angle / 180 * Math.PI) * 5;
	var spd_y = Math.sin(angle / 180 * Math.PI) * 5;

	bullet(x, y, spd_x, spd_y, id, width, height);
}

