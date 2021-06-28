
it('should fail expectation of bigint', async () => {
    expect(1n).toEqual(2n);
});
