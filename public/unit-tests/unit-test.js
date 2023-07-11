const { fireEvent } = require("@testing-library/dom");

test("handleWaldoClick sends waldoFound event when clicked on waldo", () => {
  // Mock-DOM-Elemente erstellen
  const waldoElement = document.createElement("div");
  waldoElement.id = "waldo";

  // Mock-Event erstellen
  const event = {
    clientX: 50,
    clientY: 50,
  };

  // Mock-Socket erstellen
  const socket = {
    emit: jest.fn(),
    id: "mockSocketId",
  };

  // Mock-Elemente dem DOM hinzufügen
  document.body.appendChild(waldoElement);

  // Event auslösen
  handleWaldoClick(event, socket);

  // Überprüfen, ob der waldoFound-Event mit der richtigen Socket-ID gesendet wurde
  expect(socket.emit).toHaveBeenCalledWith("waldoFound", "mockSocketId");

  // Mock-Elemente aus dem DOM entfernen
  document.body.removeChild(waldoElement);
});

test("handleWaldoClick does not send waldoFound event when clicked outside waldo", () => {
  // Mock-Event erstellen
  const event = {
    clientX: 100,
    clientY: 100,
  };

  // Mock-Socket erstellen
  const socket = {
    emit: jest.fn(),
    id: "mockSocketId",
  };

  // Event auslösen
  handleWaldoClick(event, socket);

  // Überprüfen, ob der waldoFound-Event nicht gesendet wurde
  expect(socket.emit).not.toHaveBeenCalledWith("waldoFound", "mockSocketId");
});

test("handleWaldoClick does nothing when waldo element is not present", () => {
  // Mock-Event erstellen
  const event = {
    clientX: 50,
    clientY: 50,
  };

  // Mock-Socket erstellen
  const socket = {
    emit: jest.fn(),
    id: "mockSocketId",
  };

  // Event auslösen
  handleWaldoClick(event, socket);

  // Überprüfen, ob der waldoFound-Event nicht gesendet wurde
  expect(socket.emit).not.toHaveBeenCalledWith("waldoFound", "mockSocketId");
});

test("handleWaldoClick sends waldoFound event with correct coordinates", () => {
  // Mock-DOM-Elemente erstellen
  const waldoElement = document.createElement("div");
  waldoElement.id = "waldo";
  waldoElement.getBoundingClientRect = jest.fn(() => ({
    left: 0,
    right: 100,
    top: 0,
    bottom: 100,
  }));

  // Mock-Event erstellen
  const event = {
    clientX: 50,
    clientY: 50,
  };

  // Mock-Socket erstellen
  const socket = {
    emit: jest.fn(),
    id: "mockSocketId",
  };

  // Mock-Elemente dem DOM hinzufügen
  document.body.appendChild(waldoElement);

  // Event auslösen
  handleWaldoClick(event, socket);

  // Überprüfen, ob der waldoFound-Event mit den korrekten Koordinaten gesendet wurde
  expect(socket.emit).toHaveBeenCalledWith("waldoFound", "mockSocketId");

  // Mock-Elemente aus dem DOM entfernen
  document.body.removeChild(waldoElement);
});

test("handleWaldoClick does nothing when waldo element has no boundingClientRect method", () => {
  // Mock-Event erstellen
  const event = {
    clientX: 50,
    clientY: 50,
  };

  // Mock-Socket erstellen
  const socket = {
    emit: jest.fn(),
    id: "mockSocketId",
  };

  // Mock-DOM-Element ohne boundingClientRect-Methode erstellen
  const waldoElement = {};

  // Event auslösen
  handleWaldoClick(event, socket);

  // Überprüfen, ob der waldoFound-Event nicht gesendet wurde
  expect(socket.emit).not.toHaveBeenCalledWith("waldoFound", "mockSocketId");
});
