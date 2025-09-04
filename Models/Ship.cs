using System.Collections.Generic;
using System.Linq;

namespace Battleship.Models
{
    public class Ship
    {
        public int Id { get; set; }
        public int Length { get; set; }
        public bool IsHorizontal { get; set; } = true;
        public List<(int Row, int Col)> Coordinates { get; set; } = new();

        public bool IsPlaced => Coordinates.Any();
    }
}
