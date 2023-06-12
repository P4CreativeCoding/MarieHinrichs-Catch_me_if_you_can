// Test 1: Überprüfen, ob die Funktion bei "ArrowUp" die richtige Bewegung sendet
test("handlePlayerMovement sends correct movement for ArrowUp", () => {
  const socket = {
    emit: jest.fn(),
  };

  const event = {
    key: "ArrowUp",
  };

  handlePlayerMovement(event);

  expect(socket.emit).toHaveBeenCalledWith("move", { x: 0, y: -10 });
});

// Test 2: Überprüfen, ob die Funktion bei "ArrowDown" die richtige Bewegung sendet
test("handlePlayerMovement sends correct movement for ArrowDown", () => {
  const socket = {
    emit: jest.fn(),
  };

  const event = {
    key: "ArrowDown",
  };

  handlePlayerMovement(event);

  expect(socket.emit).toHaveBeenCalledWith("move", { x: 0, y: 10 });
});

// Test 3: Überprüfen, ob die Funktion bei "ArrowLeft" die richtige Bewegung sendet
test("handlePlayerMovement sends correct movement for ArrowLeft", () => {
  const socket = {
    emit: jest.fn(),
  };

  const event = {
    key: "ArrowLeft",
  };

  handlePlayerMovement(event);

  expect(socket.emit).toHaveBeenCalledWith("move", { x: -10, y: 0 });
});

// Test 4: Überprüfen, ob die Funktion bei "ArrowRight" die richtige Bewegung sendet
test("handlePlayerMovement sends correct movement for ArrowRight", () => {
  const socket = {
    emit: jest.fn(),
  };

  const event = {
    key: "ArrowRight",
  };

  handlePlayerMovement(event);

  expect(socket.emit).toHaveBeenCalledWith("move", { x: 10, y: 0 });
});

// Test 5: Überprüfen, ob die Funktion bei einer unbekannten Taste keine Bewegung sendet
test("handlePlayerMovement does not send movement for unknown key", () => {
  const socket = {
    emit: jest.fn(),
  };

  const event = {
    key: "Space",
  };

  handlePlayerMovement(event);

  expect(socket.emit).not.toHaveBeenCalled();
});
