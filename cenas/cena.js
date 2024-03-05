// Definindo uma nova cena estendendo a classe Phaser.Scene
class Cena extends Phaser.Scene {

    // Construtor da cena
    constructor() {
        // Chamando o construtor da classe pai e fornecendo configurações iniciais
        super({
            key: 'Cena',
            physics: {
                arcade: {
                    debug: false,
                    gravity: { y: 500 }  // Configurando gravidade para a cena
                }
            }
        });
    }

    // Método de inicialização chamado antes do preload
    init() {
        // Definindo propriedades do fundo (bg), colunas (cols), jogador (player) e controles do jogo (gameControls)
        this.bg = {
            x_start: 0,
            x: 0,
            y: 200,
            x_end: -800,
            obj: null
        };

        this.cols = {
            speed: 60,
            space: 180,
            x: 500,
            min_x: 400,
            max_x: 800,
            y: -400,
            min_y: -500,
            max_y: -200,
            height: 600,
            width: 50,
            col1_obj: null,
            col2_obj: null
        };

        this.player = {
            width: 170,
            height: 133,
            obj: null
        };

        this.gameControls = {
            over: false,
            current_col_scored: false,
            score: 0,
            restartBt: null
        };
    }

    // Método para pré-carregar recursos (imagens, spritesheets, etc.)
    preload() {
        // Carregando imagens e spritesheets necessários para a cena
        this.load.image('bg', 'assets/bg.png');
        this.load.spritesheet('peladinho', 'assets/peladinho.png', { frameWidth: 64, frameHeight: 59});
        this.load.image('tijolos', 'assets/tijolos.png');
        this.load.image('gameOver', 'assets/gameover.png');
        this.load.image('restart', 'assets/reset.png');
    }

    // Método chamado para criar elementos na cena
    create() {
        // Adicionando o objeto de fundo (bg) à cena
        this.bg.obj = this.add.image(this.bg.x, this.bg.y, 'bg').setOrigin(0, 0.5).setScale(0.8);

        // Adicionando as colunas (cols) à cena
        this.cols.col1_obj = this.add.image(this.cols.x, this.cols.y, 'tijolos').setOrigin(0, 0);
        this.cols.col2_obj = this.add.image(this.cols.x, this.cols.y + this.cols.height + this.cols.space, 'tijolos').setOrigin(0, 0);
        
        // Configurando física para as colunas
        this.physics.add.existing(this.cols.col1_obj);
        this.physics.add.existing(this.cols.col2_obj);
        this.cols.col1_obj.body.allowGravity = false;
        this.cols.col2_obj.body.allowGravity = false;
        this.cols.col1_obj.body.setVelocityX(-this.cols.speed);
        this.cols.col2_obj.body.setVelocityX(-this.cols.speed);

        // Adicionando o jogador (player) à cena
        this.player.obj = this.physics.add.sprite(120, 50, 'peladinho').setScale(0.8);
        this.player.obj.body.setSize(50, 80, true);
        this.player.obj.setCollideWorldBounds(true);

        // Criando animação do jogador
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('peladinho', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // Iniciando animação do jogador
        this.player.obj.anims.play('fly');

        // Configurando controles de input (teclado e ponteiro)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;

        // Configurando colisões entre o jogador e as colunas
        this.physics.add.overlap(this.player.obj, this.cols.col1_obj, this.hitCol, null, this);
        this.physics.add.overlap(this.player.obj, this.cols.col2_obj, this.hitCol, null, this);

        // Adicionando elementos de texto à cena
        this.scoreText = this.add.text(15, 15, 'Score: 0', { fontSize: '20px', fill: '#000' });
        this.highScoreText = this.add.text(0, 15, 'High Score: ' + this.game.highScore, { fontSize: '20px', fill: '#fff', align: 'right' });
        this.highScoreText.x = this.game.config.width - this.highScoreText.width - 15;

        // Adicionando botão de reinício à cena
        this.gameControls.restartBt = this.add.image(this.game.config.width / 3.5, this.game.config.height / 1.5,
            'restart').setScale(0.2).setOrigin(0, 0).setInteractive().setVisible(false);

        // Configurando evento de clique no botão de reinício
        this.gameControls.restartBt.on('pointerdown', function () {
            if (this.gameControls.over) {
                this.gameControls.over = false;
                this.gameControls.score = 0;
                this.cols.x = -this.cols.width - 1;
                this.scene.restart();
            }
        }, this);

        // Criando animação do jogador
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('peladinho', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        // Iniciando animação do jogador
        this.player.obj.anims.play('fly');

        // Verificando se o jogador passou pelas colunas
        if (!this.gameControls.current_col_scored) {
            if (this.player.obj.x - this.player.width / 2 > this.cols.x + this.cols.width) {
                this.gameControls.score++;
                this.gameControls.current_col_scored = true;
                this.scoreText.setText('Score: ' + this.gameControls.score);
            }
        }
    }

    // Método chamado a cada quadro para atualizar a lógica do jogo
    update() {
        // Mover o background a cada 400 pixels
        if (this.bg.x < this.bg.x_end) {
            this.bg.x = this.bg.x_start;
            //

        this.bg.obj.setFrame(x+1);
        }
        this.bg.obj.x = this.bg.x;

        // Atualizando posição da coluna com base na primeira coluna
        this.cols.x = this.cols.col1_obj.x;
        
        // Verificando se as colunas se movem para fora da tela
        if (this.cols.x < -this.cols.width) {
            // Reposicionando colunas aleatoriamente
            this.cols.x = Phaser.Math.FloatBetween(this.cols.min_x, this.cols.max_x);
            this.cols.col1_obj.x = this.cols.x;
            this.cols.col2_obj.x = this.cols.x;

            this.cols.y = Phaser.Math.FloatBetween(this.cols.min_y, this.cols.max_y);
            this.cols.col1_obj.y = this.cols.y;
            this.cols.col2_obj.y = this.cols.y + this.cols.height + this.cols.space;

            this.gameControls.current_col_scored = false;
        }

        // Inclui controle de movimentação do peladinho
        if (this.cursors.left.isDown) {
            this.player.obj.setVelocityX(-200);  // Ajuste a velocidade conforme necessário
        } else if (this.cursors.right.isDown) {
            this.player.obj.setVelocityX(200);   // Ajuste a velocidade conforme necessário
        } else if (this.cursors.up.isDown) {
            this.player.obj.setVelocityY(-200);  // Ajuste a velocidade conforme necessário
        } else if (this.cursors.down.isDown) {
            this.player.obj.setVelocityY(200);   // Ajuste a velocidade conforme necessário
        } else {
            this.player.obj.setVelocity(0);  // Parar quando nenhuma tecla estiver pressionada
        }

        // Verificando se o jogador passou pelas colunas
        if (!this.gameControls.current_col_scored) {
            if (this.player.obj.x - this.player.width / 2 > this.cols.x + this.cols.width) {
                this.gameControls.score++;
                this.gameControls.current_col_scored = true;
                this.scoreText.setText('Score: ' + this.gameControls.score);
            }
        }
    }

    // Método chamado quando há colisão entre o jogador e uma coluna
    hitCol(player_obj, col_obj) {
        this.physics.pause();
        this.player.obj.anims.stop('fly');
        this.player.obj.setTint(0xff0000);
        this.gameControls.over = true;
        this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameOver').setScale(0.5);
        this.gameControls.restartBt.visible = true;
        if (this.gameControls.score > this.game.highScore) {
            this.game.highScore = this.gameControls.score;
            this.highScoreText.setText('High Score: ' + this.game.highScore);
        }
    }
}
