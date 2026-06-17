def print_board(board):
    """Print the Tic-Tac-Toe board."""
    for i in range(3):
        print(f" {board[i*3]} | {board[i*3+1]} | {board[i*3+2]} ")
        if i < 2:
            print("-----------")


def check_winner(board):
    """Check if there is a winner or a tie."""
    # Check rows
    for i in range(3):
        if board[i*3] == board[i*3+1] == board[i*3+2] != " ":
            return board[i*3]

    # Check columns
    for i in range(3):
        if board[i] == board[i+3] == board[i+6] != " ":
            return board[i]

    # Check diagonals
    if board[0] == board[4] == board[8] != " ":
        return board[0]
    if board[2] == board[4] == board[6] != " ":
        return board[2]

    # Check for a tie
    if " " not in board:
        return "Tie"

    return None

def tictactoe():
    """Main function to run the Tic-Tac-Toe game."""
    board = [" " for _ in range(9)]
    current_player = "X"

    print("Welcome to Tic-Tac-Toe!")
    print_board(board)

    while True:
        try:
            position = int(input(f"Player {current_player}, enter your move (1-9): ")) - 1
            if position < 0 or position > 8:
                print("Please enter a number between 1 and 9.")
                continue
            if board[position] != " ":
                print("That position is already taken. Try again.")
                continue

            board[position] = current_player
            print_board(board)

            winner = check_winner(board)
            if winner:
                if winner == "Tie":
                    print("It's a tie!")
                else:
                    print(f"Player {winner} wins!")
                break

            current_player = "O" if current_player == "X" else "X"
        except ValueError:
            print("Please enter a valid number.")

tictactoe()