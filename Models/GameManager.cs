using System;
using System.Collections.Generic;
using System.Linq;

namespace Battleship.Models
{
    public class GameManager
    {
        public Board PlayerBoard { get; set; } = new();
        public Board OpponentBoard { get; set; } = new();
        public List<Ship> Ships { get; set; } = new();
        public bool PlaceHorizontal { get; set; } = true;

        public GameManager()
        {
            ResetShips();
        }

        public void ResetShips()
        {
            Ships = new List<Ship>
            {
                new Ship { Id = 1, Length = 5 },
                new Ship { Id = 2, Length = 4 },
                new Ship { Id = 3, Length = 3 },
                new Ship { Id = 4, Length = 2 }
            };
            PlayerBoard.Clear();
        }

        public void RestartGame()
        {
            PlayerBoard.Clear();
            OpponentBoard.Clear();
            ResetShips();
        }

        public void ToggleDirection()
        {
            PlaceHorizontal = !PlaceHorizontal;
        }

        public void RandomizeBoard()
        {
            var rnd = new Random();
            PlayerBoard.Clear();
            foreach (var ship in Ships)
            {
                bool placed = false;
                while (!placed)
                {
                    int row = rnd.Next(0, PlayerBoard.Size);
                    int col = rnd.Next(0, PlayerBoard.Size);
                    ship.IsHorizontal = rnd.Next(2) == 0;
                    placed = PlayerBoard.PlaceShip(ship, row, col);
                }
            }
        }
    }
}
