const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeLocalUrls } = require("./normalizeLocalUrls");

test("rewrites loopback URL origins to same-origin paths recursively", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const result = normalizeLocalUrls({
        employee: {
            EmployeePhoto: "http://localhost:3000/uploads/photo.jpg",
            image: "http://127.0.0.1:4200/assets/photo.jpg"
        },
        otherUrls: ["//[::1]:3000/files/photo.jpg", "https://images.example.com/photo.jpg"],
        createdAt
    });

    assert.deepEqual(result, {
        employee: {
            EmployeePhoto: "/uploads/photo.jpg",
            image: "/assets/photo.jpg"
        },
        otherUrls: ["/files/photo.jpg", "https://images.example.com/photo.jpg"],
        createdAt
    });
    assert.equal(result.createdAt, createdAt);
});