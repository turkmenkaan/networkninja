
## Issues Noted in Labs

### bgp-ibgp-peering lab
Everything works until I run "show ip bgp 1.1.1.1/32" check on r2. I see the following output that has "1.1.1.1 (inaccessible)". Full output below. Why is that?

```
r2# show ip bgp 1.1.1.1/32
BGP routing table entry for 1.1.1.1/32, version 0
Paths: (1 available, no best path)
  Not advertised to any peer
  Local
    1.1.1.1 (inaccessible) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 100, invalid, internal
      Last update: Sun Jun 14 19:10:14 2026
```

## Other To-Do

* Set up PostHog
* Get a support option going
* Find more accounts to promote on X