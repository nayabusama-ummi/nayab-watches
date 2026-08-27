export const formatPKR = (amount: bigint | number): string => {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return `PKR ${num.toLocaleString('en-PK')}`;
};

export const serializeBigInt = <T>(obj: T): T => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
};

export const serializeProduct = (product: any) => {
  if (!product) return null;
  const serialized = serializeBigInt(product);
  return {
    ...serialized,
    formattedPrice: formatPKR(product.price),
    variants: product.variants?.map((v: any) => ({
      ...serializeBigInt(v),
      formattedPrice: formatPKR(v.price),
    })),
  };
};
