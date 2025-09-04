using System.Collections.Generic;
using System.Linq;

namespace Battleship.Models
{
    public class Board
    {
        public int Size { get; set; } = 10; // 10x10
        public int[,] Grid { get; set; }

        public Board(int size = 10)
        {
            Size = size;
            Grid = new int[size, size]; // 0 = empty, >0 = shipId
        }

        public void Clear()
        {
            Grid = new int[Size, Size];
        }

        public bool PlaceShip(Ship ship, int row, int col)
        {
            if (ship.IsHorizontal)
            {
                if (col + ship.Length > Size) return false;
                for (int i = 0; i < ship.Length; i++)
                    if (Grid[row, col + i] != 0) return false;

                for (int i = 0; i < ship.Length; i++)
                    Grid[row, col + i] = ship.Id;

                ship.Coordinates = Enumerable.Range(0, ship.Length)
                    .Select(i => (row, col + i)).ToList();
            }
            else
            {
                if (row + ship.Length > Size) return false;
                for (int i = 0; i < ship.Length; i++)
                    if (Grid[row + i, col] != 0) return false;

                for (int i = 0; i < ship.Length; i++)
                    Grid[row + i, col] = ship.Id;

                ship.Coordinates = Enumerable.Range(0, ship.Length)
                    .Select(i => (row + i, col)).ToList();
            }

            return true;
        }
    }
}
